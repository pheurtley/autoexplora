import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function generateVehicleSlug(
  year: number,
  brandSlug: string,
  modelSlug: string,
  title: string,
  id: string
): string {
  const titleWithoutBrandModel = title
    .toLowerCase()
    .replace(new RegExp(brandSlug, "gi"), "")
    .replace(new RegExp(modelSlug, "gi"), "")
    .replace(String(year), "")
    .trim();
  const titleSlug = slugify(titleWithoutBrandModel);
  const shortId = id.slice(-8);
  return [String(year), brandSlug, modelSlug, titleSlug, shortId]
    .filter(Boolean)
    .join("-");
}

async function main() {
  // Get user
  const user = await prisma.user.findUnique({
    where: { email: "pheurtley@gmail.com" },
  });
  if (!user) throw new Error("User not found");

  // Get Toyota Corolla
  const brand = await prisma.brand.findUnique({ where: { slug: "toyota" } });
  if (!brand) throw new Error("Brand not found");

  const model = await prisma.model.findFirst({
    where: { brandId: brand.id, slug: "corolla" },
  });
  if (!model) throw new Error("Model not found");

  // Get Metropolitana region
  const region = await prisma.region.findUnique({
    where: { slug: "metropolitana" },
  });
  if (!region) throw new Error("Region not found");

  const comuna = await prisma.comuna.findFirst({
    where: { regionId: region.id, slug: "las-condes" },
  });

  // Create vehicle with temp slug
  const vehicle = await prisma.vehicle.create({
    data: {
      title: "Toyota Corolla XEI 2023 Automático Impecable",
      slug: "temp-" + Date.now(),
      description:
        "Vendo Toyota Corolla XEI 2023 en excelente estado. Único dueño, mantenciones al día en servicio oficial. Full equipo: cámara de retroceso, sensores de estacionamiento, Apple CarPlay, Android Auto. Neumáticos nuevos.",
      price: 16500000,
      negotiable: true,
      vehicleType: "AUTO",
      category: "SEDAN",
      condition: "USADO",
      brandId: brand.id,
      modelId: model.id,
      year: 2023,
      mileage: 25000,
      fuelType: "BENCINA",
      transmission: "AUTOMATICA",
      color: "BLANCO",
      doors: 4,
      seats: 5,
      regionId: region.id,
      comunaId: comuna?.id,
      contactPhone: "+56912345678",
      contactWhatsApp: "+56912345678",
      showPhone: true,
      userId: user.id,
      status: "ACTIVE",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Generate proper slug
  const slug = generateVehicleSlug(
    2023,
    brand.slug,
    model.slug,
    vehicle.title,
    vehicle.id
  );

  // Update with final slug
  const updated = await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: { slug },
  });

  console.log("\n✅ Vehículo creado exitosamente!\n");
  console.log("ID:", updated.id);
  console.log("Slug:", updated.slug);
  console.log("\n🔗 URL: http://localhost:3000/vehiculos/" + updated.slug);
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
