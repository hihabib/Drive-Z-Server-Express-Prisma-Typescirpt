declare namespace Express {
    export interface Request {
        user?: {
            id: string;
            name: string;
            username: string;
            email: string;
            password?: string;
            fullName?: string;
            gander?: string;
            picture?: string;
            mobile?: string;
            country?: string;
        };
    }
}
