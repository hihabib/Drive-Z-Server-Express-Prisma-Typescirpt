import { PrismaClient } from "@prisma/client";
import { type User } from "../model/user";

const prisma = new PrismaClient();

export const getUser = async (userId: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    return user;
};
