export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'RECEPTIONIST' | 'DOCTOR';
    createdAt?: string;
}

export interface Doctor {
    _id: string;
    user: User | string; // Can be populated or ID
    specialization: string;
    department: string;
    qualifications: string[];
    experience: number;
    consultationFee: number;
    scheduleConfig?: any;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}
