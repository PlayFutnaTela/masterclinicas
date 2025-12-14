// Seed do banco de dados com dados de exemplo - Multi-Tenant
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed multi-tenant...");

  // ===== MULTI-TENANT: Criar organização =====
  const org = await prisma.organization.upsert({
    where: { slug: "clinica-beleza" },
    update: {},
    create: {
      name: "Clínica Beleza & Estética",
      slug: "clinica-beleza",
      whatsappLink: "https://wa.me/5511999999999",
      metadata: { colors: "#ff0000" },
    },
  });

  console.log("✅ Organização criada:", org.name);

  // ===== MULTI-TENANT: Criar usuário admin =====
  const adminHashedPassword = await hash("123456", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@clinica.com" },
    update: {},
    create: {
      email: "admin@clinica.com",
      password: adminHashedPassword,
      name: "Administrador",
    },
  });

  console.log("✅ Usuário admin criado:", adminUser.email);

  // ===== MULTI-TENANT: Vincular usuário admin à organização com role =====
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: org.id,
      role: "admin",
    },
  });

  console.log("✅ Usuário admin vinculado à organização como ADMIN");

  // ===== MULTI-TENANT: Criar usuário de teste =====
  const testHashedPassword = await hash("#Natalia2017", 12);

  const testUser = await prisma.user.upsert({
    where: { email: "exemplo@exemplo.com" },
    update: {},
    create: {
      email: "exemplo@exemplo.com",
      password: testHashedPassword,
      name: "Usuário de Teste",
    },
  });

  console.log("✅ Usuário de teste criado:", testUser.email);

  // ===== MULTI-TENANT: Vincular usuário de teste à organização com role =====
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: testUser.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      organizationId: org.id,
      role: "operador",
    },
  });

  console.log("✅ Usuário de teste vinculado à organização como OPERADOR");

  // ===== MULTI-TENANT: Criar leads de exemplo com organizationId =====
  const leadData = [
    { name: "Maria Silva", phone: "11999990001", procedure: "Botox", status: "qualificado" as const, source: "Instagram" },
    { name: "Ana Paula", phone: "11999990002", procedure: "Preenchimento Labial", status: "novo" as const, source: "Google" },
    { name: "Carla Santos", phone: "11999990003", procedure: "Harmonização Facial", status: "agendado" as const, source: "Indicação" },
    { name: "Fernanda Lima", phone: "11999990004", procedure: "Skincare", status: "novo" as const, source: "Instagram" },
    { name: "Juliana Costa", phone: "11999990005", procedure: "Botox", status: "qualificado" as const, source: "WhatsApp" },
    { name: "Patrícia Alves", phone: "11999990006", procedure: "Limpeza de Pele", status: "perdido" as const, source: "Google" },
    { name: "Roberta Dias", phone: "11999990007", procedure: "Bioestimuladores", status: "novo" as const, source: "Instagram" },
    { name: "Camila Rocha", phone: "11999990008", procedure: "Preenchimento Labial", status: "agendado" as const, source: "Indicação" },
  ];

  for (const lead of leadData) {
    await prisma.lead.create({
      data: {
        ...lead,
        userId: adminUser.id,
        organizationId: org.id, // ===== MULTI-TENANT: Adicionar organizationId =====
      },
    });
  }

  console.log("✅ Leads criados:", leadData.length);

  // ===== MULTI-TENANT: Criar agendamentos de exemplo com organizationId =====
  const leads = await prisma.lead.findMany({
    where: {
      userId: adminUser.id,
      organizationId: org.id, // ===== MULTI-TENANT: Adicionar organizationId =====
      status: "agendado",
    },
  });

  for (const lead of leads) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 7) + 1);
    scheduledAt.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0);

    await prisma.appointment.create({
      data: {
        leadId: lead.id,
        userId: adminUser.id,
        organizationId: org.id, // ===== MULTI-TENANT: Adicionar organizationId =====
        scheduledAt,
        status: "agendado",
      },
    });
  }

  console.log("✅ Agendamentos criados:", leads.length);

  // ===== MULTI-TENANT: Criar eventos de métrica de exemplo com organizationId =====
  const metricTypes = [
    "lead_received",
    "qualified",
    "scheduled",
    "lead_received",
    "lead_received",
    "qualified",
    "conversion",
  ] as const;

  for (const type of metricTypes) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

    await prisma.metricEvent.create({
      data: {
        type,
        userId: adminUser.id,
        organizationId: org.id, // ===== MULTI-TENANT: Adicionar organizationId =====
        createdAt,
      },
    });
  }

  console.log("✅ Eventos de métrica criados:", metricTypes.length);

  console.log("\n🎉 Seed multi-tenant concluído!");
  console.log("\n📧 Acesso Admin:");
  console.log("   Email: admin@clinica.com");
  console.log("   Senha: 123456");
  console.log("   Role: admin");
  console.log("\n📧 Acesso Teste:");
  console.log("   Email: exemplo@exemplo.com");
  console.log("   Senha: #Natalia2017");
  console.log("   Role: operador");
  console.log("\n🏢 Organização: " + org.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
