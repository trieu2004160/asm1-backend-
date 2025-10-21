import axios from "axios";

// Smart API base URL resolution
const getApiBaseUrl = () => {
  // 1. Use explicit env var if set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. Development mode detection
  if (import.meta.env.DEV) {
    return "http://localhost:4000/api";
  }
  
  // 3. Production: try to use same origin
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // If deployed on same server as backend
    return `${origin}/api`;
  }
  
  // 4. Fallback
  return "/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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

export interface CartItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
}

export interface OrderProduct {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
}

export interface ShippingAddress {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
}

export interface ApiOrder {
    _id: string;
    userId: string;
    products: OrderProduct[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: ShippingAddress;
    paymentMethod: 'cash_on_delivery' | 'stripe' | 'payos';
    paymentId?: string;
    createdAt: string;
    updatedAt: string;
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

export const ordersApi = {
    list: async (): Promise<ApiOrder[]> => {
        const { data } = await api.get("/orders");
        return data;
    },
    get: async (id: string): Promise<ApiOrder> => {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },
    create: async (payload: {
        products: { productId: string; quantity: number }[];
        shippingAddress: ShippingAddress;
        paymentMethod?: string;
    }): Promise<ApiOrder> => {
        const { data } = await api.post("/orders", payload);
        return data;
    },
    updateStatus: async (id: string, status: string): Promise<ApiOrder> => {
        const { data } = await api.put(`/orders/${id}/status`, { status });
        return data;
    },
    updatePayment: async (id: string, paymentId: string, status: string): Promise<ApiOrder> => {
        const { data } = await api.put(`/orders/${id}/payment`, { paymentId, status });
        return data;
    },
};

export default api;


