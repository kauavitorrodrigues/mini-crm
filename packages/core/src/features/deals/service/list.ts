import type { Deal, ListDealsQuery } from "@mini-crm/contracts";
import { DealRepository } from "../repository";
import { toDeal } from "./mapper";

export const listDeals = async (filters: ListDealsQuery): Promise<Deal[]> =>
    (await DealRepository.list(filters)).map(toDeal);
