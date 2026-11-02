export type Note = {
    id: string;
    dealId: string;
    authorId: string;
    author: { id: string; name: string };
    text: string;
    createdAt: string;
};
