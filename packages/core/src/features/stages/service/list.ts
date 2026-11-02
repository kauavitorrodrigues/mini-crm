import type { Stage } from "@mini-crm/contracts";
import { StageRepository } from "../repository";

export const listStages = async (): Promise<Stage[]> => StageRepository.list();
