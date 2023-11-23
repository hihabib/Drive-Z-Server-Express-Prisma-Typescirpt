import { type Request, type Response, type NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { authPrivateKey } from "../config/keys";
import { type ProtectedUserData } from "../model/authentication";

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token === undefined) {
        next({
            status: 401,
            message: "Token not found",
        });
    } else {
        req.user = jwt.verify(token, authPrivateKey) as ProtectedUserData;
        next();
    }
};
