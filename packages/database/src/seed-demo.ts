import { asc, db, eq } from "./index";
import {
    contactsTable,
    dealsTable,
    notesTable,
    stagesTable,
    usersTable,
} from "./schema";
import { seedStages, seedUser } from "./seed";

const DEMO_DOMAIN = "demo.example";

const DEMO_CONTACTS = [
    {
        name: "Ana Souza",
        company: "Padaria Pão Quente",
        phone: "11 91111-0001",
    },
    {
        name: "Bruno Lima",
        company: "Lima Contabilidade",
        phone: "21 92222-0002",
    },
    { name: "Carla Mendes", company: "Studio Mendes", phone: "31 93333-0003" },
    {
        name: "Diego Alves",
        company: "Alves Transportes",
        phone: "41 94444-0004",
    },
    { name: "Elisa Rocha", company: "Clínica Rocha", phone: "51 95555-0005" },
].map((c) => ({
    ...c,
    email: `${c.name.split(" ")[0]!.toLowerCase()}@${DEMO_DOMAIN}`,
}));

type DemoDeal = {
    contact: string;
    title: string;
    value: string;
    stageOrder: number;
    status: "OPEN" | "WON" | "LOST";
    notes?: string[];
};

const DEMO_DEALS: DemoDeal[] = [
    {
        contact: "ana",
        title: "Sistema de pedidos",
        value: "4500.00",
        stageOrder: 1,
        status: "OPEN",
        notes: ["Primeiro contato por telefone."],
    },
    {
        contact: "ana",
        title: "Site institucional",
        value: "3200.00",
        stageOrder: 2,
        status: "OPEN",
    },
    {
        contact: "bruno",
        title: "Painel financeiro",
        value: "12000.00",
        stageOrder: 3,
        status: "OPEN",
        notes: ["Enviamos a proposta.", "Cliente pediu desconto de 5%."],
    },
    {
        contact: "carla",
        title: "Agenda online",
        value: "2800.50",
        stageOrder: 4,
        status: "OPEN",
        notes: ["Aguardando assinatura do contrato."],
    },
    {
        contact: "diego",
        title: "Rastreamento de frota",
        value: "18500.00",
        stageOrder: 4,
        status: "WON",
        notes: ["Fechado! Início na próxima semana."],
    },
    {
        contact: "elisa",
        title: "Prontuário digital",
        value: "9000.00",
        stageOrder: 3,
        status: "WON",
    },
    {
        contact: "carla",
        title: "Loja virtual",
        value: "6000.00",
        stageOrder: 2,
        status: "LOST",
        notes: ["Optou por uma solução pronta."],
    },
];

/**
 * Optional presentation data: a few contacts, deals and notes. Idempotent:
 * does nothing if the first demo contact already exists. Run after the base
 * seed (it also calls it, so a fresh database works).
 */
export async function seedDemo(): Promise<void> {
    await seedUser();
    await seedStages();

    const [already] = await db
        .select({ id: contactsTable.id })
        .from(contactsTable)
        .where(eq(contactsTable.email, DEMO_CONTACTS[0]!.email));
    if (already) {
        console.log("Demo data already present, skipping.");
        return;
    }

    const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
    const [author] = email
        ? await db
              .select({ id: usersTable.id })
              .from(usersTable)
              .where(eq(usersTable.email, email))
        : [];
    if (!author) throw new Error("Seed user not found");

    const stages = await db
        .select()
        .from(stagesTable)
        .orderBy(asc(stagesTable.order));
    const stageByOrder = new Map(stages.map((s) => [s.order, s.id]));

    await db.transaction(async (tx) => {
        const contacts = await tx
            .insert(contactsTable)
            .values(DEMO_CONTACTS)
            .returning({ id: contactsTable.id, email: contactsTable.email });
        const contactByKey = new Map(
            contacts.map((c) => [c.email!.split("@")[0]!, c.id])
        );

        for (const deal of DEMO_DEALS) {
            const stageId = stageByOrder.get(deal.stageOrder);
            const contactId = contactByKey.get(deal.contact);
            if (!stageId || !contactId) throw new Error("Bad demo data");

            const [row] = await tx
                .insert(dealsTable)
                .values({
                    title: deal.title,
                    value: deal.value,
                    contactId,
                    stageId,
                    status: deal.status,
                    // Closed this month so the dashboard has numbers.
                    closedAt: deal.status === "OPEN" ? null : new Date(),
                })
                .returning({ id: dealsTable.id });
            if (!row) throw new Error("Insert returned no row");

            if (deal.notes?.length) {
                await tx.insert(notesTable).values(
                    deal.notes.map((text) => ({
                        dealId: row.id,
                        authorId: author.id,
                        text,
                    }))
                );
            }
        }
    });

    console.log(
        `✓ Seeded demo data: ${DEMO_CONTACTS.length} contacts, ${DEMO_DEALS.length} deals`
    );
}

if (require.main === module) {
    seedDemo()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
