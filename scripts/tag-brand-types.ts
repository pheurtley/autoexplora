import { PrismaClient, VehicleType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("Tagging brands with vehicle types...\n");

  const dataDir = path.join(__dirname, "../data");

  // Map: brandSlug -> Set of VehicleTypes
  const brandTypes = new Map<string, Set<VehicleType>>();

  // Read vehiculos.json -> AUTO
  const vehiculosPath = path.join(dataDir, "vehiculos.json");
  if (fs.existsSync(vehiculosPath)) {
    const data = JSON.parse(fs.readFileSync(vehiculosPath, "utf-8"));
    for (const brandName of Object.keys(data)) {
      const slug = slugify(brandName);
      if (!brandTypes.has(slug)) brandTypes.set(slug, new Set());
      brandTypes.get(slug)!.add(VehicleType.AUTO);
    }
    console.log(`  vehiculos.json: ${Object.keys(data).length} brands -> AUTO`);
  }

  // Read motos.json -> MOTO
  const motosPath = path.join(dataDir, "motos.json");
  if (fs.existsSync(motosPath)) {
    const data = JSON.parse(fs.readFileSync(motosPath, "utf-8"));
    for (const brandName of Object.keys(data)) {
      const slug = slugify(brandName);
      if (!brandTypes.has(slug)) brandTypes.set(slug, new Set());
      brandTypes.get(slug)!.add(VehicleType.MOTO);
    }
    console.log(`  motos.json: ${Object.keys(data).length} brands -> MOTO`);
  }

  console.log(`\nTotal unique brand slugs: ${brandTypes.size}`);

  // Update brands in database
  let updated = 0;
  let notFound = 0;

  for (const [slug, types] of brandTypes) {
    const vehicleTypes = Array.from(types);
    const result = await prisma.brand.updateMany({
      where: { slug },
      data: { vehicleTypes },
    });
    if (result.count > 0) {
      updated++;
    } else {
      notFound++;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Not found in DB: ${notFound}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
