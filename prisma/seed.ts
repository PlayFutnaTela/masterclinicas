// Seed do banco de dados com dados de exemplo - Supabase Auth
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("🌱 Iniciando seed com Supabase Auth...");

  // ===== Criar SUPER ADMIN (proprietário da plataforma) =====
  const { data: superAdminAuth, error: authError } = await supabase.auth.admin.createUser({
    email: "admin@masterclínicas.com",
    password: "123456",
    user_metadata: { name: "Super Admin" },
  });

  if (authError) {
    console.error("Erro ao criar usuário no auth:", authError);
    return;
  }

  const superAdminUser = await prisma.user.upsert({
    where: { email: "admin@masterclínicas.com" },
    update: {},
    create: {
      id: superAdminAuth.user.id,
      email: "admin@masterclínicas.com",
      name: "Super Admin",
      role: "super_admin",
    },
  });

  console.log("✅ SUPER ADMIN criado:", superAdminUser.email);

  // ===== Criar organização =====
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

  // ===== Criar usuário admin da clínica =====
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: "admin@clinica.com",
    password: "123456",
    user_metadata: { name: "Administrador da Clínica" },
  });

  let adminUser;
  if (adminAuthError) {
    console.error("Erro ao criar admin no auth:", adminAuthError);
  } else {
    adminUser = await prisma.user.upsert({
      where: { email: "admin@clinica.com" },
      update: {},
      create: {
        id: adminAuth.user.id,
        email: "admin@clinica.com",
        name: "Administrador da Clínica",
        role: "admin",
        organizationId: org.id,
      },
    });

    console.log("✅ Usuário admin criado:", adminUser.email);
  }

  // ===== Criar usuário de teste =====
  const { data: testAuth, error: testAuthError } = await supabase.auth.admin.createUser({
    email: "teste@clinica.com",
    password: "#Natalia2017",
    user_metadata: { name: "Usuário de Teste" },
  });

  if (testAuthError) {
    console.error("Erro ao criar teste no auth:", testAuthError);
  } else {
    const testUser = await prisma.user.upsert({
      where: { email: "teste@clinica.com" },
      update: {},
      create: {
        id: testAuth.user.id,
        email: "teste@clinica.com",
        name: "Usuário de Teste",
        role: "operador",
        organizationId: org.id,
      },
    });

    console.log("✅ Usuário de teste criado:", testUser.email);
  }

  // ===== Criar leads de exemplo com organizationId =====
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

  if (adminUser) {
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
          organizationId: org.id,
          createdAt
        });
      }
    }

    console.log("✅ Eventos de métrica criados:", metricTypes.length);
  }

  console.log("\n🎉 Seed multi-tenant concluído!");
  
  console.log("\n🔐 SUPER ADMIN (Proprietário da Plataforma):");
  console.log("   Email: admin@masterclínicas.com");
  console.log("   Senha: 123456");
  console.log("   Acesso: /organizacoes (gerenciar todas as clínicas)");
  
  console.log("\n📧 ADMIN DA CLÍNICA (Gerencia apenas Clínica Beleza):");
  console.log("   Email: admin@clinica.com");
  console.log("   Senha: 123456");
  console.log("   Role: admin");
  
  console.log("\n📧 OPERADOR DA CLÍNICA (Acesso limitado):");
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
