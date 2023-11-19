import { type Request, type Response } from "express";

const getUser = (req: Request, res: Response): void => {
    res.status(200).json({ user: req.user });
};

export default { getUser };
