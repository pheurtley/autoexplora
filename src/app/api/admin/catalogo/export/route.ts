import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all";

    let csvContent = "";
    const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility

    if (type === "brands" || type === "all") {
      const brands = await prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      });

      if (type === "brands") {
        csvContent = BOM + "id,name,slug,logo\n";
        csvContent += brands
          .map(
            (b) =>
              `"${b.id}","${b.name}","${b.slug}","${b.logo || ""}"`
          )
          .join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="marcas-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      }
    }

    if (type === "models" || type === "all") {
      const models = await prisma.model.findMany({
        orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          brand: {
            select: { id: true, name: true },
          },
        },
      });

      if (type === "models") {
        csvContent = BOM + "id,name,slug,brand_id,brand_name\n";
        csvContent += models
          .map(
            (m) =>
              `"${m.id}","${m.name}","${m.slug}","${m.brand.id}","${m.brand.name}"`
          )
          .join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="modelos-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      }
    }

    if (type === "versions" || type === "all") {
      const versions = await prisma.version.findMany({
        orderBy: [
          { model: { brand: { name: "asc" } } },
          { model: { name: "asc" } },
          { name: "asc" },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          engineSize: true,
          horsePower: true,
          transmission: true,
          drivetrain: true,
          trimLevel: true,
          model: {
            select: {
              id: true,
              name: true,
              brand: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (type === "versions") {
        csvContent =
          BOM + "id,name,slug,model_id,model_name,brand_id,brand_name,engineSize,horsePower,transmission,drivetrain,trimLevel\n";
        csvContent += versions
          .map(
            (v) =>
              `"${v.id}","${v.name}","${v.slug}","${v.model.id}","${v.model.name}","${v.model.brand.id}","${v.model.brand.name}","${v.engineSize || ""}","${v.horsePower || ""}","${v.transmission || ""}","${v.drivetrain || ""}","${v.trimLevel || ""}"`
          )
          .join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="versiones-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      }
    }

    // Export all - combined format
    if (type === "all") {
      const brands = await prisma.brand.findMany({
        orderBy: { name: "asc" },
        include: {
          models: {
            orderBy: { name: "asc" },
            include: {
              versions: {
                orderBy: { name: "asc" },
              },
            },
          },
        },
      });

      csvContent =
        BOM + "type,id,name,slug,parent_id,parent_name,brand_id,brand_name,engineSize,horsePower,transmission,drivetrain,trimLevel\n";

      for (const brand of brands) {
        csvContent += `"BRAND","${brand.id}","${brand.name}","${brand.slug}","","","","","","","","",""\n`;

        for (const model of brand.models) {
          csvContent += `"MODEL","${model.id}","${model.name}","${model.slug}","${brand.id}","${brand.name}","","","","","","",""\n`;

          for (const version of model.versions) {
            csvContent += `"VERSION","${version.id}","${version.name}","${version.slug}","${model.id}","${model.name}","${brand.id}","${brand.name}","${version.engineSize || ""}","${version.horsePower || ""}","${version.transmission || ""}","${version.drivetrain || ""}","${version.trimLevel || ""}"\n`;
          }
        }
      }

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="catalogo-completo-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Tipo de exportación no válido" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting catalog:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al exportar el catálogo" },
      { status: 500 }
    );
  }
}
