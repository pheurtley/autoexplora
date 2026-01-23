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

interface VehicleData {
  [brand: string]: { [model: string]: string[] };
}

async function main() {
  console.log("Tagging brands and models with vehicle types...\n");

  const dataDir = path.join(__dirname, "../data");

  // Map: brandSlug -> Set of VehicleTypes
  const brandTypes = new Map<string, Set<VehicleType>>();
  // Map: "brandSlug|modelSlug" -> Set of VehicleTypes
  const modelTypes = new Map<string, Set<VehicleType>>();

  const files: { file: string; type: VehicleType }[] = [
    { file: "vehiculos.json", type: VehicleType.AUTO },
    { file: "motos.json", type: VehicleType.MOTO },
  ];

  for (const { file, type } of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) continue;

    const data: VehicleData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    let brandCount = 0;
    let modelCount = 0;

    for (const brandName of Object.keys(data)) {
      const brandSlug = slugify(brandName);
      if (!brandTypes.has(brandSlug)) brandTypes.set(brandSlug, new Set());
      brandTypes.get(brandSlug)!.add(type);
      brandCount++;

      for (const modelName of Object.keys(data[brandName])) {
        const trimmed = modelName.trim();
        if (!trimmed) continue;
        const modelSlug = slugify(trimmed);
        if (!modelSlug) continue;
        const key = `${brandSlug}|${modelSlug}`;
        if (!modelTypes.has(key)) modelTypes.set(key, new Set());
        modelTypes.get(key)!.add(type);
        modelCount++;
      }
    }

    console.log(`  ${file}: ${brandCount} brands, ${modelCount} models -> ${type}`);
  }

  console.log(`\nUnique brands: ${brandTypes.size} | Unique models: ${modelTypes.size}`);

  // Update brands
  let brandsUpdated = 0;
  for (const [slug, types] of brandTypes) {
    const result = await prisma.brand.updateMany({
      where: { slug },
      data: { vehicleTypes: Array.from(types) },
    });
    if (result.count > 0) brandsUpdated++;
  }
  console.log(`\nBrands updated: ${brandsUpdated}`);

  // Update models
  let modelsUpdated = 0;
  let modelsNotFound = 0;

  // Get all brands for lookup
  const allBrands = await prisma.brand.findMany({ select: { id: true, slug: true } });
  const brandMap = new Map(allBrands.map((b) => [b.slug, b.id]));

  for (const [key, types] of modelTypes) {
    const [brandSlug, modelSlug] = key.split("|");
    const brandId = brandMap.get(brandSlug);
    if (!brandId) continue;

    const result = await prisma.model.updateMany({
      where: { brandId, slug: modelSlug },
      data: { vehicleTypes: Array.from(types) },
    });
    if (result.count > 0) {
      modelsUpdated++;
    } else {
      modelsNotFound++;
    }
  }

  console.log(`Models updated: ${modelsUpdated}`);
  console.log(`Models not found: ${modelsNotFound}`);
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
