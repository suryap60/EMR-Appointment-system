import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'RECEPTIONIST' | 'DOCTOR';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
    const saved = localStorage.getItem('auth');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch { }
    }
    return {
        user: null,
        token: null,
        isAuthenticated: false,
    };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; accessToken: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.accessToken;
            state.isAuthenticated = true;
            localStorage.setItem('auth', JSON.stringify(state));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('auth');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
