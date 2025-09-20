import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "https://asm1-backend-api-2.onrender.com/api",
});

export interface ApiProduct {
	_id?: string;
	id?: number | string;
	name: string;
	description: string;
	price: number;
	image?: string;
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

export default api;


