import { UserRepository } from "../repository";

export const findSessionUserById = async (id: string) => {
    return UserRepository.findById(id);
};
