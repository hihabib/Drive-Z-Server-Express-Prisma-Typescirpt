export interface User {
    email: string;
    username: string;
    password: string;
    fullName: string;
    gander: string;
    picture?: string;
    mobile: string;
    country: string;
}

export interface ProtectedUserData {
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
}
