import { contactsTable, dealsTable } from "@mini-crm/database";

export const dealSelect = {
    id: dealsTable.id,
    title: dealsTable.title,
    value: dealsTable.value,
    contactId: dealsTable.contactId,
    contactName: contactsTable.name,
    stageId: dealsTable.stageId,
    status: dealsTable.status,
    createdAt: dealsTable.createdAt,
    closedAt: dealsTable.closedAt,
};
