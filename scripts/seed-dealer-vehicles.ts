import { PrismaClient, VehicleCondition, DealerType } from "@prisma/client";

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
  id: string
): string {
  const shortId = id.slice(-8);
  return [String(year), brandSlug, modelSlug, shortId].join("-");
}

interface VehicleData {
  brandSlug: string;
  modelSlug: string;
  year: number;
  title: string;
  price: number;
  mileage: number;
  category: string;
  fuelType: string;
  transmission: string;
  color: string;
  description: string;
  condition: VehicleCondition;
}

// Vehicles for CONCESIONARIO (new cars)
const CONCESIONARIO_VEHICLES: VehicleData[] = [
  {
    brandSlug: "toyota",
    modelSlug: "corolla",
    year: 2024,
    title: "Toyota Corolla XEi 2024 0KM",
    price: 18990000,
    mileage: 0,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Corolla XEi 0KM con garantía de fábrica de 3 años. Incluye: Toyota Safety Sense, pantalla táctil 8\", Apple CarPlay y Android Auto. Entrega inmediata.",
    condition: "NUEVO",
  },
  {
    brandSlug: "toyota",
    modelSlug: "rav4",
    year: 2024,
    title: "Toyota RAV4 Hybrid 2024 0KM",
    price: 32990000,
    mileage: 0,
    category: "SUV",
    fuelType: "HIBRIDO",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "RAV4 Hybrid AWD-i nuevo. Consumo mixto 4.8L/100km. Equipamiento completo con techo panorámico y navegador. Garantía 5 años.",
    condition: "NUEVO",
  },
  {
    brandSlug: "toyota",
    modelSlug: "hilux",
    year: 2024,
    title: "Toyota Hilux SRX 4x4 2024 0KM",
    price: 38500000,
    mileage: 0,
    category: "PICKUP",
    fuelType: "DIESEL",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "Hilux SRX diésel automática. Motor 2.8L 204HP. Caja automática 6 velocidades. Stock disponible.",
    condition: "NUEVO",
  },
  {
    brandSlug: "hyundai",
    modelSlug: "tucson",
    year: 2024,
    title: "Hyundai Tucson 2.0 2024 0KM",
    price: 24990000,
    mileage: 0,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "AZUL",
    description: "Nueva Tucson con diseño renovado. Motor 2.0L 156HP. Pantalla 10.25\", cámara 360°, asientos calefaccionados. Garantía 7 años.",
    condition: "NUEVO",
  },
  {
    brandSlug: "hyundai",
    modelSlug: "santa-fe",
    year: 2024,
    title: "Hyundai Santa Fe 2.5T AWD 2024",
    price: 42990000,
    mileage: 0,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Santa Fe turbo AWD full equipo. 7 asientos, techo panorámico, sistema de sonido premium. El SUV familiar definitivo.",
    condition: "NUEVO",
  },
  {
    brandSlug: "kia",
    modelSlug: "sportage",
    year: 2024,
    title: "Kia Sportage GT Line 2024 0KM",
    price: 28990000,
    mileage: 0,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "ROJO",
    description: "Sportage GT Line con motor 1.6T GDi. Pantallas duales curvas, asistente de conducción avanzado. Garantía 7 años.",
    condition: "NUEVO",
  },
];

// Vehicles for AUTOMOTORA (used cars)
const AUTOMOTORA_VEHICLES: VehicleData[] = [
  {
    brandSlug: "toyota",
    modelSlug: "corolla",
    year: 2021,
    title: "Toyota Corolla SEG 2021 Automático",
    price: 14900000,
    mileage: 42000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "PLATA",
    description: "Corolla SEG único dueño. Mantenciones en servicio oficial Toyota. Libro de mantenciones al día. Excelente estado.",
    condition: "USADO",
  },
  {
    brandSlug: "mazda",
    modelSlug: "cx-5",
    year: 2020,
    title: "Mazda CX-5 R 2.0 2020 AWD",
    price: 18500000,
    mileage: 55000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "ROJO",
    description: "CX-5 AWD con todos los servicios en Derco. Cuero, techo solar, navegador. Sin choques ni reparaciones.",
    condition: "USADO",
  },
  {
    brandSlug: "honda",
    modelSlug: "civic",
    year: 2019,
    title: "Honda Civic EX-L 2019 Full",
    price: 13900000,
    mileage: 68000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "Civic turbo con techo solar, asientos cuero, sensores estacionamiento. Muy bien cuidado.",
    condition: "USADO",
  },
  {
    brandSlug: "nissan",
    modelSlug: "x-trail",
    year: 2020,
    title: "Nissan X-Trail Exclusive 2020",
    price: 17900000,
    mileage: 48000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "X-Trail 7 asientos, 4x4. Cámara 360°, piloto automático adaptativo. Perfecta para familia.",
    condition: "USADO",
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "tiguan",
    year: 2021,
    title: "Volkswagen Tiguan Highline 2021",
    price: 21900000,
    mileage: 35000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "Tiguan TSI 1.4T. Asientos cuero, techo panorámico, sistema de sonido Fender. Impecable estado.",
    condition: "USADO",
  },
  {
    brandSlug: "chevrolet",
    modelSlug: "tracker",
    year: 2022,
    title: "Chevrolet Tracker Premier 2022",
    price: 15900000,
    mileage: 25000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NARANJA",
    description: "Tracker turbo 1.2L, muy económico. OnStar activo, cámara reversa, sensores. Como nuevo.",
    condition: "USADO",
  },
  {
    brandSlug: "subaru",
    modelSlug: "forester",
    year: 2019,
    title: "Subaru Forester 2.0i AWD 2019",
    price: 16500000,
    mileage: 72000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "VERDE",
    description: "Forester con tracción integral permanente y EyeSight. Ideal para viajes y terrenos difíciles.",
    condition: "USADO",
  },
  {
    brandSlug: "hyundai",
    modelSlug: "accent",
    year: 2020,
    title: "Hyundai Accent GL 2020",
    price: 9900000,
    mileage: 45000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Accent automático con A/C, dirección asistida, airbags. Excelente primer auto.",
    condition: "USADO",
  },
  // Premium used cars
  {
    brandSlug: "bmw",
    modelSlug: "x3",
    year: 2021,
    title: "BMW X3 xDrive30i 2021",
    price: 38900000,
    mileage: 32000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "X3 xDrive30i M Sport Package. Interior cuero Vernasca, sistema de navegación Professional. Mantenida en servicio oficial.",
    condition: "USADO",
  },
  {
    brandSlug: "mercedes-benz",
    modelSlug: "glc",
    year: 2020,
    title: "Mercedes-Benz GLC 300 4MATIC 2020",
    price: 42500000,
    mileage: 38000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "GLC 300 AMG Line. Techo panorámico, sistema MBUX, Burmester Sound. Historial completo en servicio Mercedes.",
    condition: "USADO",
  },
  {
    brandSlug: "audi",
    modelSlug: "q5",
    year: 2021,
    title: "Audi Q5 45 TFSI quattro 2021",
    price: 45900000,
    mileage: 28000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "Q5 S Line con Virtual Cockpit, Matrix LED, suspensión adaptativa. Único dueño, servicio Audi.",
    condition: "USADO",
  },
  {
    brandSlug: "volvo",
    modelSlug: "xc60",
    year: 2020,
    title: "Volvo XC60 T5 Momentum 2020",
    price: 36500000,
    mileage: 42000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "AZUL",
    description: "XC60 con Pilot Assist, Sensus Navigation, sistema de sonido Harman Kardon. Seguridad escandinava.",
    condition: "USADO",
  },
];

// Vehicles for RENT_A_CAR (ex-rental, low mileage used)
const RENT_A_CAR_VEHICLES: VehicleData[] = [
  {
    brandSlug: "toyota",
    modelSlug: "yaris",
    year: 2023,
    title: "Toyota Yaris 1.5 XLS 2023 Ex-Rental",
    price: 12500000,
    mileage: 18000,
    category: "HATCHBACK",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "BLANCO",
    description: "Ex-unidad de arriendo con bajo kilometraje y mantenciones al día. Garantía de fábrica vigente. Excelente oportunidad.",
    condition: "USADO",
  },
  {
    brandSlug: "suzuki",
    modelSlug: "swift",
    year: 2023,
    title: "Suzuki Swift GL 2023 Ex-Flota",
    price: 10900000,
    mileage: 22000,
    category: "HATCHBACK",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "ROJO",
    description: "Swift automático de nuestra flota. Mantenciones en servicio oficial Suzuki. Muy económico en combustible.",
    condition: "USADO",
  },
  {
    brandSlug: "hyundai",
    modelSlug: "tucson",
    year: 2022,
    title: "Hyundai Tucson 2.0 2022 Ex-Rental",
    price: 19900000,
    mileage: 35000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "GRIS",
    description: "Tucson ex-flota premium. Historial de mantenciones completo. Ideal para familia. Financiamiento disponible.",
    condition: "USADO",
  },
  {
    brandSlug: "kia",
    modelSlug: "rio",
    year: 2023,
    title: "Kia Rio EX 2023 Ex-Arriendo",
    price: 11500000,
    mileage: 15000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "PLATA",
    description: "Rio sedán con pocos kilómetros. A/C, dirección asistida, airbags, ABS. Revisión técnica al día.",
    condition: "USADO",
  },
  {
    brandSlug: "nissan",
    modelSlug: "kicks",
    year: 2022,
    title: "Nissan Kicks Advance 2022",
    price: 14900000,
    mileage: 28000,
    category: "SUV",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "NEGRO",
    description: "Kicks de nuestra flota de arriendo. Excelente estado, cámara reversa, pantalla táctil. Lista para entregar.",
    condition: "USADO",
  },
  {
    brandSlug: "chevrolet",
    modelSlug: "onix",
    year: 2023,
    title: "Chevrolet Onix Premier 2023",
    price: 11900000,
    mileage: 12000,
    category: "SEDAN",
    fuelType: "BENCINA",
    transmission: "AUTOMATICA",
    color: "AZUL",
    description: "Onix turbo prácticamente nuevo. WiFi, OnStar, MyLink. El sedán más tecnológico de su categoría.",
    condition: "USADO",
  },
];

async function main() {
  console.log("🚗 Creando vehículos para concesionarios de prueba...\n");

  // Get all active dealers
  const dealers = await prisma.dealer.findMany({
    where: { status: "ACTIVE" },
    include: {
      users: {
        where: { dealerRole: "OWNER" },
        take: 1,
      },
      region: true,
    },
  });

  if (dealers.length === 0) {
    throw new Error("No hay dealers activos. Ejecuta primero: npx tsx scripts/seed-test-dealers.ts");
  }

  console.log(`📋 Encontrados ${dealers.length} dealers activos\n`);

  // Get all brands with models
  const brands = await prisma.brand.findMany({
    include: { models: true },
  });

  // Get comunas by region
  const comunasByRegion: Record<string, { id: string; name: string }[]> = {};
  for (const dealer of dealers) {
    if (!comunasByRegion[dealer.regionId]) {
      const comunas = await prisma.comuna.findMany({
        where: { regionId: dealer.regionId },
      });
      comunasByRegion[dealer.regionId] = comunas;
    }
  }

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const dealer of dealers) {
    const owner = dealer.users[0];
    if (!owner) {
      console.log(`⚠️  ${dealer.tradeName}: Sin usuario owner`);
      continue;
    }

    // Select vehicles based on dealer type
    let vehiclePool: VehicleData[];
    switch (dealer.type) {
      case DealerType.CONCESIONARIO:
        vehiclePool = CONCESIONARIO_VEHICLES;
        break;
      case DealerType.RENT_A_CAR:
        vehiclePool = RENT_A_CAR_VEHICLES;
        break;
      case DealerType.AUTOMOTORA:
      default:
        vehiclePool = AUTOMOTORA_VEHICLES;
        break;
    }

    // Select random vehicles (3-6 per dealer)
    const numVehicles = Math.floor(Math.random() * 4) + 3;
    const shuffled = [...vehiclePool].sort(() => Math.random() - 0.5);
    const selectedVehicles = shuffled.slice(0, numVehicles);

    console.log(`\n🏢 ${dealer.tradeName} (${dealer.type}):`);

    let dealerCreated = 0;

    for (const data of selectedVehicles) {
      // Find brand
      const brand = brands.find((b) => b.slug === data.brandSlug);
      if (!brand) {
        console.log(`   ⚠️  Marca no encontrada: ${data.brandSlug}`);
        totalSkipped++;
        continue;
      }

      // Find model
      const model = brand.models.find((m) => m.slug === data.modelSlug);
      if (!model) {
        console.log(`   ⚠️  Modelo no encontrado: ${data.modelSlug}`);
        totalSkipped++;
        continue;
      }

      // Random comuna from dealer's region
      const comunas = comunasByRegion[dealer.regionId] || [];
      const comuna = comunas.length > 0
        ? comunas[Math.floor(Math.random() * comunas.length)]
        : null;

      try {
        // Create vehicle with temp slug
        const vehicle = await prisma.vehicle.create({
          data: {
            title: data.title,
            slug: "temp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
            description: data.description,
            price: data.price,
            negotiable: Math.random() > 0.6,
            vehicleType: "AUTO",
            category: data.category as "SEDAN" | "SUV" | "HATCHBACK" | "PICKUP",
            condition: data.condition,
            brandId: brand.id,
            modelId: model.id,
            year: data.year,
            mileage: data.mileage,
            fuelType: data.fuelType as "BENCINA" | "DIESEL" | "HIBRIDO",
            transmission: data.transmission as "MANUAL" | "AUTOMATICA",
            color: data.color,
            doors: 4,
            seats: 5,
            regionId: dealer.regionId,
            comunaId: comuna?.id,
            contactPhone: dealer.phone,
            contactWhatsApp: dealer.whatsapp || undefined,
            showPhone: true,
            userId: owner.id,
            dealerId: dealer.id,
            status: "ACTIVE",
            featured: Math.random() > 0.7,
            publishedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        });

        // Generate proper slug
        const slug = generateVehicleSlug(data.year, brand.slug, model.slug, vehicle.id);

        // Update with final slug
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { slug },
        });

        console.log(`   ✅ ${data.title}`);
        dealerCreated++;
        totalCreated++;
      } catch (error) {
        console.log(`   ❌ Error: ${data.title}`, error);
        totalSkipped++;
      }
    }

    console.log(`   📊 ${dealerCreated} vehículos creados`);
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Resumen Total:`);
  console.log(`   Vehículos creados: ${totalCreated}`);
  console.log(`   Omitidos: ${totalSkipped}`);

  // Count by dealer
  const vehiclesByDealer = await prisma.vehicle.groupBy({
    by: ["dealerId"],
    _count: { id: true },
    where: { dealerId: { not: null } },
  });

  console.log(`\n📈 Vehículos por dealer:`);
  for (const item of vehiclesByDealer) {
    const dealer = dealers.find((d) => d.id === item.dealerId);
    if (dealer) {
      console.log(`   ${dealer.tradeName}: ${item._count.id}`);
    }
  }

  console.log(`\n🔗 Ver vehículos en:`);
  for (const dealer of dealers) {
    console.log(`   http://localhost:3000/concesionario/${dealer.slug}`);
  }
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
