import { PrismaClient, DealerType, DealerStatus, DealerRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface DealerData {
  type: DealerType;
  status: DealerStatus;
  businessName: string;
  tradeName: string;
  rut: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address: string;
  regionSlug: string;
  comunaSlug?: string;
  description: string;
  // Owner user
  ownerName: string;
  ownerEmail: string;
  // Additional team members
  team?: Array<{
    name: string;
    email: string;
    role: DealerRole;
  }>;
}

const DEALER_DATA: DealerData[] = [
  // ==================== AUTOMOTORAS (Nuevos) ====================
  {
    type: "AUTOMOTORA",
    status: "ACTIVE",
    businessName: "Automotriz del Sur SpA",
    tradeName: "Toyota Sur",
    rut: "76.543.210-K",
    email: "ventas@toyotasur.cl",
    phone: "+56222334455",
    whatsapp: "+56912345678",
    website: "https://www.toyotasur.cl",
    address: "Av. Vicuña Mackenna 1234",
    regionSlug: "metropolitana",
    comunaSlug: "la-florida",
    description: "Automotora oficial Toyota con más de 20 años de experiencia. Venta de vehículos nuevos, servicio técnico autorizado y repuestos originales. Financiamiento directo disponible.",
    ownerName: "Carlos Mendoza",
    ownerEmail: "carlos@toyotasur.cl",
    team: [
      { name: "María González", email: "maria@toyotasur.cl", role: "MANAGER" },
      { name: "Pedro Soto", email: "pedro@toyotasur.cl", role: "SALES" },
    ],
  },
  {
    type: "AUTOMOTORA",
    status: "ACTIVE",
    businessName: "Hyundai Providencia Ltda",
    tradeName: "Hyundai Providencia",
    rut: "77.888.999-1",
    email: "contacto@hyundaiprovidencia.cl",
    phone: "+56223456789",
    whatsapp: "+56998765432",
    website: "https://www.hyundaiprovidencia.cl",
    address: "Av. Providencia 2345",
    regionSlug: "metropolitana",
    comunaSlug: "providencia",
    description: "Automotora Hyundai certificada. Ofrecemos toda la gama de vehículos nuevos Hyundai con garantía de fábrica de 7 años. Servicio post-venta y repuestos genuinos.",
    ownerName: "Andrea Muñoz",
    ownerEmail: "andrea@hyundaiprovidencia.cl",
  },
  {
    type: "AUTOMOTORA",
    status: "PENDING",
    businessName: "Kia Motors Norte SpA",
    tradeName: "Kia Antofagasta",
    rut: "76.111.222-3",
    email: "info@kiaantofagasta.cl",
    phone: "+56552345678",
    address: "Av. Argentina 567",
    regionSlug: "antofagasta",
    description: "Nueva automotora Kia en la región de Antofagasta. Próximamente disponibles todos los modelos de la marca.",
    ownerName: "Roberto Silva",
    ownerEmail: "roberto@kiaantofagasta.cl",
  },

  // ==================== AUTOMOTORAS (Usados) ====================
  {
    type: "AUTOMOTORA",
    status: "ACTIVE",
    businessName: "Automotora El Llano SpA",
    tradeName: "Autos El Llano",
    rut: "76.222.333-4",
    email: "ventas@autosellano.cl",
    phone: "+56223334455",
    whatsapp: "+56911112222",
    website: "https://www.autosellano.cl",
    address: "Av. Departamental 890",
    regionSlug: "metropolitana",
    comunaSlug: "san-bernardo",
    description: "Más de 15 años vendiendo vehículos usados de calidad. Todos nuestros autos pasan por una revisión técnica exhaustiva. Financiamiento con todas las instituciones.",
    ownerName: "Juan Pérez",
    ownerEmail: "juan@autosellano.cl",
    team: [
      { name: "Luis Vargas", email: "luis@autosellano.cl", role: "SALES" },
      { name: "Ana Díaz", email: "ana@autosellano.cl", role: "SALES" },
    ],
  },
  {
    type: "AUTOMOTORA",
    status: "ACTIVE",
    businessName: "Comercial Automotriz Viña SpA",
    tradeName: "Autos Viña del Mar",
    rut: "76.333.444-5",
    email: "contacto@autosvina.cl",
    phone: "+56322345678",
    whatsapp: "+56933334444",
    address: "Av. Libertad 1234",
    regionSlug: "valparaiso",
    comunaSlug: "vina-del-mar",
    description: "Especialistas en vehículos usados seleccionados. Garantía de 6 meses en todos nuestros autos. Parte de pago aceptado.",
    ownerName: "Fernanda Lagos",
    ownerEmail: "fernanda@autosvina.cl",
  },
  {
    type: "AUTOMOTORA",
    status: "ACTIVE",
    businessName: "Premium Cars Chile SpA",
    tradeName: "Premium Cars",
    rut: "76.444.555-6",
    email: "ventas@premiumcars.cl",
    phone: "+56224445566",
    whatsapp: "+56944445555",
    website: "https://www.premiumcars.cl",
    address: "Av. Apoquindo 5678",
    regionSlug: "metropolitana",
    comunaSlug: "las-condes",
    description: "Vehículos premium y de lujo usados. BMW, Mercedes-Benz, Audi, Porsche y más. Todos con historial verificado y mantenciones al día.",
    ownerName: "Sebastián Araya",
    ownerEmail: "sebastian@premiumcars.cl",
    team: [
      { name: "Camila Fuentes", email: "camila@premiumcars.cl", role: "MANAGER" },
    ],
  },
  {
    type: "AUTOMOTORA",
    status: "SUSPENDED",
    businessName: "Autos Baratos del Centro Ltda",
    tradeName: "Autos Baratos",
    rut: "76.555.666-7",
    email: "info@autosbaratos.cl",
    phone: "+56225556677",
    address: "Av. Matta 2345",
    regionSlug: "metropolitana",
    comunaSlug: "santiago",
    description: "Vehículos económicos al mejor precio.",
    ownerName: "Miguel Torres",
    ownerEmail: "miguel@autosbaratos.cl",
  },
  {
    type: "AUTOMOTORA",
    status: "REJECTED",
    businessName: "Comercial Dudosa SpA",
    tradeName: "AutosDudosos",
    rut: "76.666.777-8",
    email: "contacto@dudosos.cl",
    phone: "+56226667788",
    address: "Calle Sin Número 123",
    regionSlug: "metropolitana",
    description: "Venta de vehículos varios.",
    ownerName: "Persona Rechazada",
    ownerEmail: "rechazado@dudosos.cl",
  },

  // ==================== RENT A CAR ====================
  {
    type: "RENT_A_CAR",
    status: "ACTIVE",
    businessName: "Arriendo de Autos Chile SpA",
    tradeName: "Chile Rent a Car",
    rut: "76.777.888-9",
    email: "reservas@chilerentacar.cl",
    phone: "+56227778899",
    whatsapp: "+56977778888",
    website: "https://www.chilerentacar.cl",
    address: "Aeropuerto AMB, Local 45",
    regionSlug: "metropolitana",
    comunaSlug: "pudahuel",
    description: "Arriendo de vehículos en aeropuerto y ciudad. Flota nueva y variada. También vendemos parte de nuestra flota con historial de mantención completo.",
    ownerName: "Patricia Rojas",
    ownerEmail: "patricia@chilerentacar.cl",
    team: [
      { name: "Diego Castillo", email: "diego@chilerentacar.cl", role: "MANAGER" },
      { name: "Carolina Vera", email: "carolina@chilerentacar.cl", role: "SALES" },
    ],
  },
  {
    type: "RENT_A_CAR",
    status: "ACTIVE",
    businessName: "Sur Rent a Car Ltda",
    tradeName: "Sur Rent a Car",
    rut: "76.888.999-0",
    email: "info@surrentacar.cl",
    phone: "+56452345678",
    whatsapp: "+56988889999",
    address: "Av. Alemania 789",
    regionSlug: "los-rios",
    comunaSlug: "valdivia",
    description: "Arriendo de vehículos en el sur de Chile. 4x4, camionetas y SUVs ideales para la zona. Venta de unidades con bajo kilometraje.",
    ownerName: "Gonzalo Riquelme",
    ownerEmail: "gonzalo@surrentacar.cl",
  },
  {
    type: "RENT_A_CAR",
    status: "PENDING",
    businessName: "Norte Rent SpA",
    tradeName: "Norte Rent",
    rut: "76.999.000-1",
    email: "contacto@norterent.cl",
    phone: "+56572345678",
    address: "Av. Balmaceda 456",
    regionSlug: "tarapaca",
    description: "Próximamente servicio de arriendo de vehículos en Iquique. Flota moderna y tarifas competitivas.",
    ownerName: "Isabel Cortés",
    ownerEmail: "isabel@norterent.cl",
  },
];

async function main() {
  console.log("🏢 Creando automotoras de prueba...\n");

  // Hash password for all users
  const passwordHash = await bcrypt.hash("Test1234!", 10);

  let created = 0;
  let skipped = 0;

  for (const data of DEALER_DATA) {
    try {
      // Find region
      const region = await prisma.region.findUnique({
        where: { slug: data.regionSlug },
      });
      if (!region) {
        console.log(`⚠️  Región no encontrada: ${data.regionSlug}`);
        skipped++;
        continue;
      }

      // Find comuna if specified
      let comuna = null;
      if (data.comunaSlug) {
        comuna = await prisma.comuna.findFirst({
          where: {
            slug: data.comunaSlug,
            regionId: region.id,
          },
        });
      }

      // Check if dealer already exists
      const existingDealer = await prisma.dealer.findFirst({
        where: {
          OR: [
            { rut: data.rut.replace(/\./g, "").replace(/-/g, "") },
            { email: data.email },
            { slug: slugify(data.tradeName) },
          ],
        },
      });

      if (existingDealer) {
        console.log(`⏭️  Ya existe: ${data.tradeName}`);
        skipped++;
        continue;
      }

      // Check if owner user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.ownerEmail },
      });

      if (existingUser) {
        console.log(`⏭️  Usuario ya existe: ${data.ownerEmail}`);
        skipped++;
        continue;
      }

      // Create dealer
      const dealer = await prisma.dealer.create({
        data: {
          slug: slugify(data.tradeName),
          type: data.type,
          status: data.status,
          businessName: data.businessName,
          tradeName: data.tradeName,
          rut: data.rut.replace(/\./g, "").replace(/-/g, ""), // Store without formatting
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp,
          website: data.website,
          address: data.address,
          regionId: region.id,
          comunaId: comuna?.id,
          description: data.description,
          verifiedAt: data.status === "ACTIVE" ? new Date() : null,
          rejectionReason: data.status === "REJECTED" ? "Documentación incompleta o inválida" : null,
          schedule: {
            lunes: { open: "09:00", close: "18:00" },
            martes: { open: "09:00", close: "18:00" },
            miercoles: { open: "09:00", close: "18:00" },
            jueves: { open: "09:00", close: "18:00" },
            viernes: { open: "09:00", close: "18:00" },
            sabado: { open: "10:00", close: "14:00" },
            domingo: null,
          },
        },
      });

      // Create owner user
      await prisma.user.create({
        data: {
          name: data.ownerName,
          email: data.ownerEmail,
          password: passwordHash,
          emailVerified: new Date(),
          dealerId: dealer.id,
          dealerRole: "OWNER",
        },
      });

      // Create team members if any
      if (data.team) {
        for (const member of data.team) {
          await prisma.user.create({
            data: {
              name: member.name,
              email: member.email,
              password: passwordHash,
              emailVerified: new Date(),
              dealerId: dealer.id,
              dealerRole: member.role,
            },
          });
        }
      }

      const statusEmoji = {
        ACTIVE: "✅",
        PENDING: "⏳",
        SUSPENDED: "⛔",
        REJECTED: "❌",
      };

      const typeLabel = {
        AUTOMOTORA: "Automotora",
        RENT_A_CAR: "Rent a Car",
      };

      console.log(
        `${statusEmoji[data.status]} [${typeLabel[data.type]}] ${data.tradeName} (${data.ownerEmail})`
      );
      created++;
    } catch (error) {
      console.log(`❌ Error creando: ${data.tradeName}`, error);
      skipped++;
    }
  }

  // Summary
  const dealerCounts = await prisma.dealer.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const typeCounts = await prisma.dealer.groupBy({
    by: ["type"],
    _count: { type: true },
  });

  console.log(`\n📊 Resumen:`);
  console.log(`   Creados: ${created}`);
  console.log(`   Omitidos: ${skipped}`);
  console.log(`\n📈 Por estado:`);
  dealerCounts.forEach((c) => {
    console.log(`   ${c.status}: ${c._count.status}`);
  });
  console.log(`\n📈 Por tipo:`);
  typeCounts.forEach((c) => {
    console.log(`   ${c.type}: ${c._count.type}`);
  });

  console.log(`\n🔑 Credenciales de prueba:`);
  console.log(`   Email: carlos@toyotasur.cl`);
  console.log(`   Password: Test1234!`);
  console.log(`\n🔗 URLs:`);
  console.log(`   Panel dealer: http://localhost:3000/dealer`);
  console.log(`   Admin: http://localhost:3000/admin/automotoras`);
  console.log(`   Registro: http://localhost:3000/registro/automotora`);
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
