import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const instance = axios.create({
	baseURL,
	headers: { "Content-Type": "application/json" },
});

// Attach token if present
instance.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default instance;
