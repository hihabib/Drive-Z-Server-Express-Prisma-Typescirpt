import { type Request, type Response } from "express";
import service from "../service/auth";

export const signup = (req: Request, res: Response): void => {
    (async () => {
        const isUserCreated = await service.saveUser(req.body);
        if (!isUserCreated) {
            throw new Error("User is not created");
        }
        res.status(201).json({ message: "Signup successful." });
    })().catch((error) => {
        console.log(error);
        res.status(501).json({
            message: "Something went wrong",
        });
    });
};
export const signin = (req: Request, res: Response): void => {
    (async () => {
        try {
            const { username, password } = req.body;
            const userValidation = await service.userValidityChecker(
                username,
                password,
            );
            if (userValidation !== false) {
                const { token, user } = userValidation;
                res.status(200).json({
                    user,
                    token,
                });
            } else {
                res.status(401).json({ token: "invalid login" });
            }
        } catch (error) {
            console.log(error);
        }
    })().catch((error) => {
        console.log(error);
    });
};
