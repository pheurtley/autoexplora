import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Cleanup: Conservar solo WebCars y admin ===\n");

  // 1. Find WebCars dealer
  const webCarsDealer = await prisma.dealer.findUnique({
    where: { slug: "webcars" },
  });

  if (!webCarsDealer) {
    console.error("ERROR: No se encontró el dealer WebCars (slug: 'webcars')");
    process.exit(1);
  }
  console.log(`Dealer WebCars encontrado: ${webCarsDealer.businessName} (${webCarsDealer.id})`);

  // 2. Find admin user(s)
  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
  });

  if (adminUsers.length === 0) {
    console.error("ERROR: No se encontró ningún usuario con role ADMIN");
    process.exit(1);
  }
  console.log(`Usuarios admin encontrados: ${adminUsers.length}`);

  // 3. Find users associated with WebCars dealer
  const webCarsUsers = await prisma.user.findMany({
    where: { dealerId: webCarsDealer.id },
  });
  console.log(`Usuarios asociados a WebCars: ${webCarsUsers.length}`);

  // 4. Build preserved IDs
  const preservedUserIds = [
    ...adminUsers.map((u) => u.id),
    ...webCarsUsers.map((u) => u.id),
  ];
  const uniquePreservedUserIds = [...new Set(preservedUserIds)];
  console.log(`\nUsuarios a preservar: ${uniquePreservedUserIds.length}`);
  for (const user of [...adminUsers, ...webCarsUsers]) {
    console.log(`  - ${user.name || user.email} (${user.role}, dealerId: ${user.dealerId || "none"})`);
  }

  // 5. Counts before cleanup
  const countsBefore = {
    vehicles: await prisma.vehicle.count(),
    users: await prisma.user.count(),
    dealers: await prisma.dealer.count(),
  };
  console.log("\n--- Conteos ANTES de la limpieza ---");
  console.log(`  Vehicles: ${countsBefore.vehicles}`);
  console.log(`  Users: ${countsBefore.users}`);
  console.log(`  Dealers: ${countsBefore.dealers}`);

  // 6. Delete in order (respecting foreign keys)
  console.log("\n--- Ejecutando limpieza ---");

  // 6a. Handle Report foreign keys (reporterId and resolvedById have no cascade)
  const deletedReports = await prisma.report.deleteMany({
    where: {
      reporterId: { notIn: uniquePreservedUserIds },
    },
  });
  console.log(`  Reports eliminados (reporter no preservado): ${deletedReports.count}`);

  const updatedReports = await prisma.report.updateMany({
    where: {
      resolvedById: { notIn: uniquePreservedUserIds },
      NOT: { resolvedById: null },
    },
    data: { resolvedById: null },
  });
  console.log(`  Reports actualizados (resolvedById limpiado): ${updatedReports.count}`);

  // 6b. Handle Vehicle.moderatedById foreign key (no cascade)
  const updatedVehicles = await prisma.vehicle.updateMany({
    where: {
      moderatedById: { notIn: uniquePreservedUserIds },
      NOT: { moderatedById: null },
    },
    data: { moderatedById: null },
  });
  console.log(`  Vehicles actualizados (moderatedById limpiado): ${updatedVehicles.count}`);

  // 6c. Delete vehicles not belonging to WebCars or preserved users
  const deletedVehicles = await prisma.vehicle.deleteMany({
    where: {
      AND: [
        { dealerId: { not: webCarsDealer.id } },
        { userId: { notIn: uniquePreservedUserIds } },
      ],
    },
  });
  console.log(`  Vehicles eliminados: ${deletedVehicles.count}`);

  // 6d. Delete users not preserved
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { notIn: uniquePreservedUserIds },
    },
  });
  console.log(`  Users eliminados: ${deletedUsers.count}`);

  // 6e. Delete dealers that are not WebCars
  const deletedDealers = await prisma.dealer.deleteMany({
    where: {
      id: { not: webCarsDealer.id },
    },
  });
  console.log(`  Dealers eliminados: ${deletedDealers.count}`);

  // 7. Counts after cleanup
  const countsAfter = {
    vehicles: await prisma.vehicle.count(),
    users: await prisma.user.count(),
    dealers: await prisma.dealer.count(),
  };
  console.log("\n--- Conteos DESPUÉS de la limpieza ---");
  console.log(`  Vehicles: ${countsAfter.vehicles}`);
  console.log(`  Users: ${countsAfter.users}`);
  console.log(`  Dealers: ${countsAfter.dealers}`);

  console.log("\n=== Limpieza completada ===");
}

main()
  .catch((e) => {
    console.error("Error durante la limpieza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
