import { PrismaClient } from "@prisma/client";
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

// Parse version name to extract metadata
function parseVersionMetadata(versionName: string): {
  engineSize: string | null;
  horsePower: number | null;
  transmission: string | null;
  drivetrain: string | null;
  trimLevel: string | null;
} {
  const name = versionName.toUpperCase();

  // Extract engine size (e.g., "1.4", "2.0", "V6", "V8", "3.0")
  let engineSize: string | null = null;
  const engineMatch = name.match(/(\d\.\d+|\d,\d+|V\d+|\d{4}CC|\d\.\dL)/i);
  if (engineMatch) {
    engineSize = engineMatch[1].replace(",", ".");
  }

  // Extract horsepower (e.g., "280 CV", "200 HP", "280HP")
  let horsePower: number | null = null;
  const hpMatch = name.match(/(\d{2,3})\s*(CV|HP|BHP|PS|CABALLOS)/i);
  if (hpMatch) {
    horsePower = parseInt(hpMatch[1], 10);
  }

  // Extract transmission
  let transmission: string | null = null;
  if (/\b(AUTO|AUT|AT|AUTOMATIC|AUTOMATICA?|STRONIC|S-TRONIC|S TRONIC|MULTITRONIC|TIPTRONIC|DSG|CVT|PDK|STEPTRONIC)\b/i.test(name)) {
    transmission = "automatica";
  } else if (/\b(MANUAL|MT|MEC|MECANICO)\b/i.test(name)) {
    transmission = "manual";
  } else if (/\b(SEMI|SEMIAUTOMATICA?|SECUENCIAL)\b/i.test(name)) {
    transmission = "semiautomatica";
  }

  // Extract drivetrain
  let drivetrain: string | null = null;
  if (/\b(4X4|4WD|AWD|QUATTRO|XDRIVE|4MOTION|4MATIC|ALL4)\b/i.test(name)) {
    drivetrain = "4x4";
  } else if (/\b(4X2|2WD|FWD|RWD)\b/i.test(name)) {
    drivetrain = "2wd";
  }

  // Extract trim level
  let trimLevel: string | null = null;
  const trimPatterns = [
    /\b(S\s*LINE|S-LINE|SLINE)\b/i,
    /\b(SPORT|DEPORTIVO)\b/i,
    /\b(VELOCE)\b/i,
    /\b(AMBITION)\b/i,
    /\b(ATTRACTION)\b/i,
    /\b(PROGRESSIVE?)\b/i,
    /\b(DISTINCTIVE)\b/i,
    /\b(SUPER)\b/i,
    /\b(GT\s*LINE|GT-LINE|GTLINE)\b/i,
    /\b(HIGHLINE)\b/i,
    /\b(COMFORTLINE)\b/i,
    /\b(TRENDLINE)\b/i,
    /\b(TITANIUM)\b/i,
    /\b(LIMITED)\b/i,
    /\b(PREMIER)\b/i,
    /\b(ADVANCE)\b/i,
    /\b(EXCLUSIVE)\b/i,
    /\b(LUXURY)\b/i,
    /\b(ELEGANCE)\b/i,
    /\b(DYNAMIC)\b/i,
    /\b(DESIGN)\b/i,
  ];

  for (const pattern of trimPatterns) {
    const match = name.match(pattern);
    if (match) {
      trimLevel = match[1].replace(/\s+/g, " ").trim();
      break;
    }
  }

  return {
    engineSize,
    horsePower,
    transmission,
    drivetrain,
    trimLevel,
  };
}

interface VehicleData {
  [brand: string]: {
    [model: string]: string[];
  };
}

async function main() {
  console.log("🚗 Importando datos de vehículos...\n");

  // Read JSON file
  const jsonPath = path.join(__dirname, "../data/vehiculos.json");
  const jsonContent = fs.readFileSync(jsonPath, "utf-8");
  const vehicleData: VehicleData = JSON.parse(jsonContent);

  const stats = {
    brandsCreated: 0,
    brandsExisting: 0,
    modelsCreated: 0,
    modelsExisting: 0,
    versionsCreated: 0,
    versionsExisting: 0,
    errors: 0,
  };

  const brandNames = Object.keys(vehicleData);
  console.log(`📦 Procesando ${brandNames.length} marcas...\n`);

  for (const brandName of brandNames) {
    const brandSlug = slugify(brandName);

    // Find or create brand
    let brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          slug: brandSlug,
        },
      });
      stats.brandsCreated++;
      console.log(`✅ Marca creada: ${brandName}`);
    } else {
      stats.brandsExisting++;
    }

    const models = vehicleData[brandName];

    for (const modelName of Object.keys(models)) {
      const modelSlug = slugify(modelName);

      // Find or create model
      let model = await prisma.model.findUnique({
        where: {
          brandId_slug: {
            brandId: brand.id,
            slug: modelSlug,
          },
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelName,
            slug: modelSlug,
            brandId: brand.id,
          },
        });
        stats.modelsCreated++;
        console.log(`  📁 Modelo creado: ${brandName} ${modelName}`);
      } else {
        stats.modelsExisting++;
      }

      const versions = models[modelName];

      for (const versionName of versions) {
        if (!versionName || versionName.trim() === "") continue;

        const versionSlug = slugify(versionName);

        // Check if version exists
        const existingVersion = await prisma.version.findUnique({
          where: {
            modelId_slug: {
              modelId: model.id,
              slug: versionSlug,
            },
          },
        });

        if (!existingVersion) {
          try {
            // Parse metadata from version name
            const metadata = parseVersionMetadata(versionName);

            await prisma.version.create({
              data: {
                name: versionName.trim(),
                slug: versionSlug,
                modelId: model.id,
                ...metadata,
              },
            });
            stats.versionsCreated++;
          } catch (error) {
            console.error(`    ❌ Error creando versión: ${versionName}`, error);
            stats.errors++;
          }
        } else {
          stats.versionsExisting++;
        }
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMEN DE IMPORTACIÓN");
  console.log("=".repeat(50));
  console.log(`\n🏭 Marcas:`);
  console.log(`   Creadas: ${stats.brandsCreated}`);
  console.log(`   Existentes: ${stats.brandsExisting}`);
  console.log(`\n🚙 Modelos:`);
  console.log(`   Creados: ${stats.modelsCreated}`);
  console.log(`   Existentes: ${stats.modelsExisting}`);
  console.log(`\n📋 Versiones:`);
  console.log(`   Creadas: ${stats.versionsCreated}`);
  console.log(`   Existentes: ${stats.versionsExisting}`);
  console.log(`\n❌ Errores: ${stats.errors}`);
  console.log("=".repeat(50));
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
