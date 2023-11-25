import { authPrivateKey } from "../../config/keys";
import * as jwt from "jsonwebtoken";
import { type ProtectedUserData, type User } from "../model/authentication";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { createDirectory } from "./structures";

const prisma = new PrismaClient();
const saveUser = async ({
    fullName,
    username,
    email,
    password,
    gander = "male",
    mobile,
    picture,
    country,
}: User): Promise<boolean> => {
    try {
        const saltRound = Number(process.env.SALTROUNDS) ?? 10;
        const hash = await bcrypt.hash(password, saltRound);
        const savedUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hash,
                profile: {
                    create: {
                        picture: picture ?? null,
                        mobile,
                        gander:
                            gander === "male"
                                ? "male"
                                : gander === "female"
                                    ? "female"
                                    : "others",
                        country,
                        fullName,
                    },
                },
            },
        });
        await createDirectory(savedUser.id, "");
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
const userValidityChecker = async (
    username: string,
    password: string,
): Promise<
    | {
          token: string;
          user: ProtectedUserData;
      }
    | false
> => {
    // check user login in db then return the token.
    try {
        const {
            password: hash,
            profile,
            email,
            id,
        } = (await prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true,
                username: true,
                password: true,
                email: true,
                profile: {
                    select: {
                        picture: true,
                        fullName: true,
                        country: true,
                        gander: true,
                        mobile: true,
                    },
                },
            },
        })) ?? {};
        if (hash !== undefined) {
            const isValidLogin = await bcrypt.compare(password, hash);
            if (!isValidLogin) {
                return false;
            }
            const user = {
                id: id ?? "",
                name: profile?.fullName ?? "",
                username,
                email: email ?? "",
                gander: profile?.gander ?? "",
                picture: profile?.picture ?? "",
                mobile: profile?.mobile ?? "",
                country: profile?.country ?? "",
            } satisfies ProtectedUserData; // add more info of user from DB
            // we will implement full authentication system later.

            const token = jwt.sign(user, authPrivateKey, {
                expiresIn: "50000h",
            });
            return {
                token,
                user,
            };
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export default {
    userValidityChecker,
    saveUser,
};
