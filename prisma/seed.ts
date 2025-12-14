// Seed do banco de dados com dados de exemplo
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed...");

    // Criar usuário admin de exemplo
    const hashedPassword = await hash("123456", 12);

    const user = await prisma.user.upsert({
        where: { email: "admin@clinica.com" },
        update: {},
        create: {
            email: "admin@clinica.com",
            password: hashedPassword,
            name: "Administrador",
            clinicName: "Clínica Beleza & Estética",
            role: "admin",
            whatsappLink: "https://wa.me/5511999999999",
            apiKey: "sk_demo_" + Math.random().toString(36).substring(2, 15),
        },
    });

    console.log("✅ Usuário criado:", user.email);

    // Criar usuário de teste
    const testHashedPassword = await hash("#Natalia2017", 12);

    const testUser = await prisma.user.upsert({
        where: { email: "exemplo@exemplo.com" },
        update: {},
        create: {
            email: "exemplo@exemplo.com",
            password: testHashedPassword,
            name: "Usuário de Teste",
            clinicName: "Clínica Exemplo",
            role: "admin",
            whatsappLink: "https://wa.me/5511999999999",
            apiKey: "sk_test_" + Math.random().toString(36).substring(2, 15),
        },
    });

    console.log("✅ Usuário de teste criado:", testUser.email);

    // Criar leads de exemplo
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
                userId: user.id,
            },
        });
    }

    console.log("✅ Leads criados:", leadData.length);

    // Criar agendamentos de exemplo
    const leads = await prisma.lead.findMany({
        where: { userId: user.id, status: "agendado" },
    });

    for (const lead of leads) {
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 7) + 1);
        scheduledAt.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0);

        await prisma.appointment.create({
            data: {
                leadId: lead.id,
                userId: user.id,
                scheduledAt,
                status: "agendado",
            },
        });
    }

    console.log("✅ Agendamentos criados:", leads.length);

    // Criar eventos de métrica de exemplo
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
                userId: user.id,
                createdAt,
            },
        });
    }

    console.log("✅ Eventos de métrica criados:", metricTypes.length);

    console.log("\n🎉 Seed concluído!");
    console.log("\n📧 Login: admin@clinica.com");
    console.log("🔑 Senha: 123456");
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
