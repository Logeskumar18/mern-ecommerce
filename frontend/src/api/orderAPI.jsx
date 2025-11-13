import api from "./axiosInstance";

export const createOrder = async (payload) => {
	const res = await api.post("/orders", payload);
	return res.data;
};

export const fetchOrders = async (params = {}) => {
	const res = await api.get("/orders", { params });
	return res.data;
};

export const fetchOrder = async (id) => {
	const res = await api.get(`/orders/${id}`);
	return res.data;
};
