export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'RECEPTIONIST' | 'DOCTOR';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface LoginFormValues {
    email: string;
    password: string;
}

