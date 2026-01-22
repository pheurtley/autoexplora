import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface ImportRow {
  type?: string;
  id?: string;
  name: string;
  slug?: string;
  parent_id?: string;
  parent_name?: string;
  brand_id?: string;
  brand_name?: string;
  model_id?: string;
  model_name?: string;
  engineSize?: string;
  horsePower?: string;
  transmission?: string;
  drivetrain?: string;
  trimLevel?: string;
  logo?: string;
}

function parseCSV(content: string): ImportRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: ImportRow = { name: "" };
    headers.forEach((header, index) => {
      const value = values[index]?.replace(/"/g, "") || "";
      (row as unknown as Record<string, string>)[header] = value;
    });

    return row;
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const content = await file.text();
    const rows = parseCSV(content);

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío o mal formateado" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    // Detect format based on headers/content
    const firstRow = rows[0];
    const hasType = "type" in firstRow;

    if (hasType) {
      // Combined format with type column
      for (const row of rows) {
        try {
          if (row.type === "BRAND") {
            const slug = row.slug || slugify(row.name);
            if (row.id) {
              const existing = await prisma.brand.findUnique({
                where: { id: row.id },
              });
              if (existing) {
                await prisma.brand.update({
                  where: { id: row.id },
                  data: { name: row.name, slug, logo: row.logo || null },
                });
                updated++;
              } else {
                await prisma.brand.create({
                  data: { name: row.name, slug, logo: row.logo || null },
                });
                created++;
              }
            } else {
              await prisma.brand.upsert({
                where: { slug },
                update: { name: row.name, logo: row.logo || null },
                create: { name: row.name, slug, logo: row.logo || null },
              });
              created++;
            }
          } else if (row.type === "MODEL") {
            const brandId = row.parent_id || row.brand_id;
            if (!brandId) {
              errors++;
              continue;
            }

            const slug = row.slug || slugify(row.name);
            if (row.id) {
              const existing = await prisma.model.findUnique({
                where: { id: row.id },
              });
              if (existing) {
                await prisma.model.update({
                  where: { id: row.id },
                  data: { name: row.name, slug },
                });
                updated++;
              } else {
                await prisma.model.create({
                  data: { name: row.name, slug, brandId },
                });
                created++;
              }
            } else {
              await prisma.model.upsert({
                where: { brandId_slug: { brandId, slug } },
                update: { name: row.name },
                create: { name: row.name, slug, brandId },
              });
              created++;
            }
          } else if (row.type === "VERSION") {
            const modelId = row.parent_id || row.model_id;
            if (!modelId) {
              errors++;
              continue;
            }

            const slug = row.slug || slugify(row.name);
            const versionData = {
              name: row.name,
              slug,
              engineSize: row.engineSize || null,
              horsePower: row.horsePower ? parseInt(row.horsePower) : null,
              transmission: row.transmission || null,
              drivetrain: row.drivetrain || null,
              trimLevel: row.trimLevel || null,
            };

            if (row.id) {
              const existing = await prisma.version.findUnique({
                where: { id: row.id },
              });
              if (existing) {
                await prisma.version.update({
                  where: { id: row.id },
                  data: versionData,
                });
                updated++;
              } else {
                await prisma.version.create({
                  data: { ...versionData, modelId },
                });
                created++;
              }
            } else {
              await prisma.version.upsert({
                where: { modelId_slug: { modelId, slug } },
                update: versionData,
                create: { ...versionData, modelId },
              });
              created++;
            }
          }
        } catch (e) {
          console.error("Error importing row:", row, e);
          errors++;
        }
      }
    } else if ("brand_name" in firstRow && "model_name" in firstRow) {
      // Versions format
      for (const row of rows) {
        try {
          let brandId = row.brand_id;
          if (!brandId && row.brand_name) {
            const brand = await prisma.brand.findFirst({
              where: { name: { equals: row.brand_name, mode: "insensitive" } },
            });
            brandId = brand?.id;
          }
          if (!brandId) {
            errors++;
            continue;
          }

          let modelId = row.model_id;
          if (!modelId && row.model_name) {
            const model = await prisma.model.findFirst({
              where: {
                brandId,
                name: { equals: row.model_name, mode: "insensitive" },
              },
            });
            modelId = model?.id;
          }
          if (!modelId) {
            errors++;
            continue;
          }

          const slug = row.slug || slugify(row.name);
          const versionData = {
            name: row.name,
            slug,
            engineSize: row.engineSize || null,
            horsePower: row.horsePower ? parseInt(row.horsePower) : null,
            transmission: row.transmission || null,
            drivetrain: row.drivetrain || null,
            trimLevel: row.trimLevel || null,
          };

          await prisma.version.upsert({
            where: { modelId_slug: { modelId, slug } },
            update: versionData,
            create: { ...versionData, modelId },
          });
          created++;
        } catch (e) {
          console.error("Error importing version row:", row, e);
          errors++;
        }
      }
    } else if ("brand_name" in firstRow || "brand_id" in firstRow) {
      // Models format
      for (const row of rows) {
        try {
          let brandId = row.brand_id;
          if (!brandId && row.brand_name) {
            const brand = await prisma.brand.findFirst({
              where: { name: { equals: row.brand_name, mode: "insensitive" } },
            });
            brandId = brand?.id;
          }
          if (!brandId) {
            errors++;
            continue;
          }

          const slug = row.slug || slugify(row.name);
          await prisma.model.upsert({
            where: { brandId_slug: { brandId, slug } },
            update: { name: row.name },
            create: { name: row.name, slug, brandId },
          });
          created++;
        } catch (e) {
          console.error("Error importing model row:", row, e);
          errors++;
        }
      }
    } else {
      // Brands format
      for (const row of rows) {
        try {
          const slug = row.slug || slugify(row.name);
          await prisma.brand.upsert({
            where: { slug },
            update: { name: row.name, logo: row.logo || null },
            create: { name: row.name, slug, logo: row.logo || null },
          });
          created++;
        } catch (e) {
          console.error("Error importing brand row:", row, e);
          errors++;
        }
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (error) {
    console.error("Error importing catalog:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al importar el catálogo" },
      { status: 500 }
    );
  }
}
