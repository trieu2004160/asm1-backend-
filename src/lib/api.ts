import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
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
		const { data } = await api.get("/api/products");
		return data;
	},
	get: async (id: string): Promise<ApiProduct> => {
		const { data } = await api.get(`/api/products/${id}`);
		return data;
	},
	create: async (payload: Omit<ApiProduct, "id">): Promise<ApiProduct> => {
		const { data } = await api.post("/api/products", payload);
		return data;
	},
	update: async (id: string | number, payload: Partial<Omit<ApiProduct, "id">>): Promise<ApiProduct> => {
		const { data } = await api.put(`/api/products/${id}`, payload);
		return data;
	},
	remove: async (id: string | number): Promise<void> => {
		await api.delete(`/api/products/${id}`);
	},
};

export default api;


