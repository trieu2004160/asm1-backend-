import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
});

// Attach JWT from localStorage if present
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("tc_token");
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) {
        // ignore storage errors
    }
    return config;
});

export interface ApiProduct {
	_id?: string;
	id?: number | string;
	name: string;
	description: string;
	price: number;
	image?: string;
	category?: string;
}

export const productsApi = {
	list: async (): Promise<ApiProduct[]> => {
		const { data } = await api.get("/products");
		return data;
	},
	get: async (id: string): Promise<ApiProduct> => {
		const { data } = await api.get(`/products/${id}`);
		return data;
	},
	create: async (payload: Omit<ApiProduct, "id">): Promise<ApiProduct> => {
		const { data } = await api.post("/products", payload);
		return data;
	},
	update: async (id: string | number, payload: Partial<Omit<ApiProduct, "id">>): Promise<ApiProduct> => {
		const { data } = await api.put(`/products/${id}`, payload);
		return data;
	},
	remove: async (id: string | number): Promise<void> => {
		await api.delete(`/products/${id}`);
	},
};

export interface AuthUser {
    _id: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export const authApi = {
    register: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post("/auth/register", { email, password });
        return data;
    },
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post("/auth/login", { email, password });
        return data;
    },
    googleLogin: async (credential: string): Promise<AuthResponse> => {
        const { data } = await api.post("/auth/google", { credential });
        return data;
    },
    logout: async (): Promise<void> => {
        localStorage.removeItem("tc_token");
        localStorage.removeItem("tc_user");
    },
    persistSession: (auth: AuthResponse) => {
        localStorage.setItem("tc_token", auth.token);
        localStorage.setItem("tc_user", JSON.stringify(auth.user));
    },
    getCurrentUser: (): AuthUser | null => {
        try {
            const raw = localStorage.getItem("tc_user");
            return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch {
            return null;
        }
    },
};

export default api;


