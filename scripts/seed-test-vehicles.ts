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

const VEHICLE_DATA = [
  {
    brandSlug: "toyota",
    modelSlug: "rav4",
    year: 2022,
    title: "Toyota RAV4 Hybrid 2022 Full Equipo",
    price: 28500000,
    mileage: 18000,
    category: "SUV",
    fuelType: "HIBRIDO",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "RAV4 Hybrid en excelente estado. Bajo consumo, tecnología de punta.",
  },
  {
    brandSlug: "honda",
    modelSlug: "civic",
    year: 2021,
    title: "Honda Civic EX-L 2021 Automático",
    price: 19800000,
    mileage: 32000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "Civic EX-L con techo solar, asientos de cuero, cámara 360.",
  },
  {
    brandSlug: "mazda",
    modelSlug: "cx-5",
    year: 2023,
    title: "Mazda CX-5 Grand Touring 2023",
    price: 32000000,
    mileage: 5000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "ROJO",
    description: "Prácticamente nuevo, único dueño, servicio oficial.",
  },
  {
    brandSlug: "hyundai",
    modelSlug: "tucson",
    year: 2020,
    title: "Hyundai Tucson 2.0 2020 4x4",
    price: 18500000,
    mileage: 45000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Tucson 4x4, ideal para familia. Mantenciones al día.",
  },
  {
    brandSlug: "kia",
    modelSlug: "sportage",
    year: 2022,
    title: "Kia Sportage GT Line 2022",
    price: 26000000,
    mileage: 22000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "AZUL",
    description: "Sportage GT Line full equipo, techo panorámico.",
  },
  {
    brandSlug: "nissan",
    modelSlug: "sentra",
    year: 2019,
    title: "Nissan Sentra Advance 2019",
    price: 12500000,
    mileage: 58000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "PLATA",
    description: "Sentra económico, excelente rendimiento de combustible.",
  },
  {
    brandSlug: "chevrolet",
    modelSlug: "tracker",
    year: 2021,
    title: "Chevrolet Tracker Premier 2021",
    price: 17900000,
    mileage: 28000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NARANJA",
    description: "Tracker turbo, muy completo y económico.",
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "tiguan",
    year: 2020,
    title: "Volkswagen Tiguan Highline 2020",
    price: 24500000,
    mileage: 35000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "Tiguan Highline TSI, asientos cuero, navegador.",
  },
  {
    brandSlug: "ford",
    modelSlug: "escape",
    year: 2022,
    title: "Ford Escape Titanium 2022 Híbrido",
    price: 29000000,
    mileage: 12000,
    category: "SUV",
    fuelType: "HIBRIDO",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Escape híbrido plug-in, muy bajo consumo.",
  },
  {
    brandSlug: "subaru",
    modelSlug: "forester",
    year: 2021,
    title: "Subaru Forester AWD 2021",
    price: 25500000,
    mileage: 30000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "VERDE",
    description: "Forester con tracción integral permanente, EyeSight.",
  },
  {
    brandSlug: "toyota",
    modelSlug: "hilux",
    year: 2023,
    title: "Toyota Hilux SRV 4x4 2023",
    price: 35000000,
    mileage: 8000,
    category: "PICKUP",
    fuelType: "DIESEL",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "Hilux diésel automática, la pickup más confiable.",
  },
  {
    brandSlug: "mitsubishi",
    modelSlug: "l200",
    year: 2020,
    title: "Mitsubishi L200 Katana 2020",
    price: 22000000,
    mileage: 55000,
    category: "PICKUP",
    fuelType: "DIESEL",
    transmission: "MANUAL",
    color: "NEGRO",
    description: "L200 Katana con barra antivuelco y neblineros.",
  },
  {
    brandSlug: "suzuki",
    modelSlug: "swift",
    year: 2022,
    title: "Suzuki Swift GLX 2022",
    price: 12800000,
    mileage: 15000,
    category: "HATCHBACK",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "ROJO",
    description: "Swift compacto y ágil, ideal para ciudad.",
  },
  {
    brandSlug: "peugeot",
    modelSlug: "3008",
    year: 2021,
    title: "Peugeot 3008 GT Line 2021",
    price: 27500000,
    mileage: 25000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "AZUL",
    description: "3008 con i-Cockpit, diseño francés premium.",
  },
  {
    brandSlug: "renault",
    modelSlug: "duster",
    year: 2022,
    title: "Renault Duster Intens 2022",
    price: 15500000,
    mileage: 20000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "MANUAL",
    color: "CAFE",
    description: "Duster versátil y económica, ideal todo terreno.",
  },
  {
    brandSlug: "jeep",
    modelSlug: "compass",
    year: 2021,
    title: "Jeep Compass Limited 2021 4x4",
    price: 28000000,
    mileage: 28000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Compass 4x4 con espíritu aventurero.",
  },
  {
    brandSlug: "bmw",
    modelSlug: "x1",
    year: 2020,
    title: "BMW X1 sDrive20i 2020",
    price: 29500000,
    mileage: 38000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "X1 premium alemán, deportivo y elegante.",
  },
  {
    brandSlug: "mercedes-benz",
    modelSlug: "gla",
    year: 2021,
    title: "Mercedes-Benz GLA 200 2021",
    price: 34000000,
    mileage: 22000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "PLATA",
    description: "GLA compacto premium, tecnología MBUX.",
  },
  {
    brandSlug: "audi",
    modelSlug: "q3",
    year: 2022,
    title: "Audi Q3 35 TFSI 2022",
    price: 36000000,
    mileage: 15000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "Q3 con Virtual Cockpit y diseño vanguardista.",
  },
  {
    brandSlug: "volvo",
    modelSlug: "xc40",
    year: 2021,
    title: "Volvo XC40 T4 Momentum 2021",
    price: 32500000,
    mileage: 25000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "XC40 escandinavo, máxima seguridad y confort.",
  },
];

async function main() {
  console.log("🚗 Creando 20 vehículos de prueba...\n");

  // Get user
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No hay usuarios en la base de datos");
  console.log(`Usuario: ${user.email}\n`);

  // Get all brands with models
  const brands = await prisma.brand.findMany({
    include: { models: true },
  });

  // Get Metropolitana region
  const region = await prisma.region.findUnique({
    where: { slug: "metropolitana" },
  });
  if (!region) throw new Error("Región Metropolitana no encontrada");

  const comunas = await prisma.comuna.findMany({
    where: { regionId: region.id },
  });

  let created = 0;
  let skipped = 0;

  for (const data of VEHICLE_DATA) {
    // Find brand
    const brand = brands.find((b) => b.slug === data.brandSlug);
    if (!brand) {
      console.log(`⚠️  Marca no encontrada: ${data.brandSlug}`);
      skipped++;
      continue;
    }

    // Find model
    const model = brand.models.find((m) => m.slug === data.modelSlug);
    if (!model) {
      console.log(`⚠️  Modelo no encontrado: ${data.modelSlug} (${brand.name})`);
      skipped++;
      continue;
    }

    // Random comuna
    const comuna = comunas[Math.floor(Math.random() * comunas.length)];

    try {
      // Create vehicle with temp slug
      const vehicle = await prisma.vehicle.create({
        data: {
          title: data.title,
          slug: "temp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          description: data.description,
          price: data.price,
          negotiable: Math.random() > 0.5,
          vehicleType: "AUTO",
          category: data.category as "SEDAN" | "SUV" | "HATCHBACK" | "PICKUP",
          condition: "USADO",
          brandId: brand.id,
          modelId: model.id,
          year: data.year,
          mileage: data.mileage,
          fuelType: data.fuelType as "BENCINA" | "DIESEL" | "HIBRIDO",
          transmission: data.transmission as "MANUAL" | "AUTOMATICA",
          color: data.color,
          doors: 4,
          seats: 5,
          regionId: region.id,
          comunaId: comuna.id,
          contactPhone: "+56912345678",
          contactWhatsApp: "+56912345678",
          showPhone: true,
          userId: user.id,
          status: "ACTIVE",
          featured: Math.random() > 0.7, // 30% destacados
          publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // últimos 30 días
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Generate proper slug
      const slug = generateVehicleSlug(
        data.year,
        brand.slug,
        model.slug,
        vehicle.title,
        vehicle.id
      );

      // Update with final slug
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { slug },
      });

      console.log(`✅ ${data.title}`);
      created++;
    } catch (error) {
      console.log(`❌ Error creando: ${data.title}`, error);
      skipped++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Creados: ${created}`);
  console.log(`   Omitidos: ${skipped}`);
  console.log(`\n🔗 Ver en: http://localhost:3000/vehiculos`);
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
