import { PrismaClient } from "@prisma/client";
import { REGIONES_CHILE } from "../src/data/regiones-chile";
import {
  MARCAS_VEHICULOS,
  MARCAS_MOTOS,
  MARCAS_COMERCIALES,
} from "../src/data/marcas-vehiculos";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...\n");

  // ==================== Seed Regiones y Comunas ====================
  console.log("📍 Seeding regiones and comunas...");

  for (const region of REGIONES_CHILE) {
    const createdRegion = await prisma.region.upsert({
      where: { slug: region.slug },
      update: {},
      create: {
        name: region.name,
        slug: region.slug,
        order: region.order,
      },
    });

    for (const comuna of region.comunas) {
      await prisma.comuna.upsert({
        where: {
          regionId_slug: {
            regionId: createdRegion.id,
            slug: comuna.slug,
          },
        },
        update: {},
        create: {
          name: comuna.name,
          slug: comuna.slug,
          regionId: createdRegion.id,
        },
      });
    }
  }

  console.log(`✅ Created ${REGIONES_CHILE.length} regiones with comunas\n`);

  // ==================== Seed Marcas de Autos ====================
  console.log("🚗 Seeding car brands and models...");

  for (const marca of MARCAS_VEHICULOS) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: marca.slug },
      update: {},
      create: {
        name: marca.name,
        slug: marca.slug,
      },
    });

    for (const model of marca.models) {
      await prisma.model.upsert({
        where: {
          brandId_slug: {
            brandId: createdBrand.id,
            slug: model.slug,
          },
        },
        update: {},
        create: {
          name: model.name,
          slug: model.slug,
          brandId: createdBrand.id,
        },
      });
    }
  }

  console.log(`✅ Created ${MARCAS_VEHICULOS.length} car brands with models\n`);

  // ==================== Seed Marcas de Motos ====================
  console.log("🏍️ Seeding motorcycle brands and models...");

  for (const marca of MARCAS_MOTOS) {
    // Buscar si la marca ya existe por slug o por nombre
    let createdBrand = await prisma.brand.findUnique({
      where: { slug: marca.slug },
    });

    if (!createdBrand) {
      // Buscar por nombre (puede existir con otro slug)
      createdBrand = await prisma.brand.findUnique({
        where: { name: marca.name },
      });
    }

    if (!createdBrand) {
      createdBrand = await prisma.brand.create({
        data: {
          name: marca.name,
          slug: marca.slug,
        },
      });
    }

    for (const model of marca.models) {
      await prisma.model.upsert({
        where: {
          brandId_slug: {
            brandId: createdBrand.id,
            slug: model.slug,
          },
        },
        update: {},
        create: {
          name: model.name,
          slug: model.slug,
          brandId: createdBrand.id,
        },
      });
    }
  }

  console.log(
    `✅ Created ${MARCAS_MOTOS.length} motorcycle brands with models\n`
  );

  // ==================== Seed Marcas Comerciales ====================
  console.log("🚚 Seeding commercial vehicle brands and models...");

  for (const marca of MARCAS_COMERCIALES) {
    // Buscar si la marca ya existe por slug o por nombre
    let createdBrand = await prisma.brand.findUnique({
      where: { slug: marca.slug },
    });

    if (!createdBrand) {
      // Buscar por nombre (puede existir con otro slug)
      createdBrand = await prisma.brand.findUnique({
        where: { name: marca.name },
      });
    }

    if (!createdBrand) {
      createdBrand = await prisma.brand.create({
        data: {
          name: marca.name,
          slug: marca.slug,
        },
      });
    }

    for (const model of marca.models) {
      await prisma.model.upsert({
        where: {
          brandId_slug: {
            brandId: createdBrand.id,
            slug: model.slug,
          },
        },
        update: {},
        create: {
          name: model.name,
          slug: model.slug,
          brandId: createdBrand.id,
        },
      });
    }
  }

  console.log(
    `✅ Created ${MARCAS_COMERCIALES.length} commercial brands with models\n`
  );

  // ==================== Summary ====================
  const regionCount = await prisma.region.count();
  const comunaCount = await prisma.comuna.count();
  const brandCount = await prisma.brand.count();
  const modelCount = await prisma.model.count();

  console.log("📊 Seed Summary:");
  console.log(`   - Regiones: ${regionCount}`);
  console.log(`   - Comunas: ${comunaCount}`);
  console.log(`   - Marcas: ${brandCount}`);
  console.log(`   - Modelos: ${modelCount}`);
  console.log("\n✨ Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
