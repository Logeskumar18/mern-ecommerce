import api from "./axiosInstance";

export const fetchProducts = async (params = {}) => {
	const res = await api.get("/products", { params });
	return res.data;
};

export const fetchProduct = async (id) => {
	const res = await api.get(`/products/${id}`);
	return res.data;
};

export const createProduct = async (data) => {
	const res = await api.post("/products", data);
	return res.data;
};

export const updateProduct = async (id, data) => {
	const res = await api.put(`/products/${id}`, data);
	return res.data;
};

export const deleteProduct = async (id) => {
	const res = await api.delete(`/products/${id}`);
	return res.data;
};
