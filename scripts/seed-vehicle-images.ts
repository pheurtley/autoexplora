import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample car images from Unsplash (free to use)
// Organized by general type/color for variety
const CAR_IMAGES: Record<string, string[]> = {
  // SUVs
  SUV: [
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  ],
  // Sedans
  SEDAN: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  ],
  // Hatchbacks
  HATCHBACK: [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
  ],
  // Pickups
  PICKUP: [
    "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
    "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80",
  ],
  // Premium/Luxury
  PREMIUM: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  ],
  // Generic/Fallback
  DEFAULT: [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
    "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
  ],
};

// Additional interior/detail images
const DETAIL_IMAGES = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80",
  "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80",
  "https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&q=80",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
];

const PREMIUM_BRANDS = ["bmw", "mercedes-benz", "audi", "volvo", "porsche", "lexus", "jaguar", "land-rover"];

function getImagePool(category: string, brandSlug: string): string[] {
  // Premium brands get premium images
  if (PREMIUM_BRANDS.includes(brandSlug.toLowerCase())) {
    return CAR_IMAGES.PREMIUM;
  }

  // Otherwise by category
  const pool = CAR_IMAGES[category];
  if (pool && pool.length > 0) {
    return pool;
  }

  return CAR_IMAGES.DEFAULT;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function main() {
  console.log("🖼️  Agregando imágenes a vehículos...\n");

  // Get all vehicles without images
  const vehicles = await prisma.vehicle.findMany({
    where: {
      images: {
        none: {},
      },
    },
    include: {
      brand: true,
    },
  });

  if (vehicles.length === 0) {
    console.log("✅ Todos los vehículos ya tienen imágenes");
    return;
  }

  console.log(`📋 Encontrados ${vehicles.length} vehículos sin imágenes\n`);

  let totalImages = 0;

  for (const vehicle of vehicles) {
    const imagePool = getImagePool(vehicle.category, vehicle.brand.slug);
    const detailPool = shuffleArray(DETAIL_IMAGES);

    // Select 3-5 images per vehicle
    const numImages = Math.floor(Math.random() * 3) + 3;
    const shuffledPool = shuffleArray(imagePool);

    const imagesToCreate: { url: string; isPrimary: boolean; order: number }[] = [];

    // Primary image from category pool
    imagesToCreate.push({
      url: shuffledPool[0],
      isPrimary: true,
      order: 0,
    });

    // Additional images mixing category and detail images
    for (let i = 1; i < numImages; i++) {
      const useDetail = i > 2 && detailPool.length > 0;
      const url = useDetail
        ? detailPool[i % detailPool.length]
        : shuffledPool[i % shuffledPool.length];

      imagesToCreate.push({
        url,
        isPrimary: false,
        order: i,
      });
    }

    // Create images for this vehicle
    await prisma.vehicleImage.createMany({
      data: imagesToCreate.map((img) => ({
        vehicleId: vehicle.id,
        url: img.url,
        publicId: `sample-${vehicle.id}-${img.order}`,
        isPrimary: img.isPrimary,
        order: img.order,
      })),
    });

    console.log(`✅ ${vehicle.title}: ${imagesToCreate.length} imágenes`);
    totalImages += imagesToCreate.length;
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Resumen:`);
  console.log(`   Vehículos actualizados: ${vehicles.length}`);
  console.log(`   Imágenes agregadas: ${totalImages}`);
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
