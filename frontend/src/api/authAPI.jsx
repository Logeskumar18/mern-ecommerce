import api from "./axiosInstance";

export const login = async (credentials) => {
	const res = await api.post("/auth/login", credentials);
	return res.data;
};

export const signup = async (data) => {
	const res = await api.post("/auth/signup", data);
	return res.data;
};

export const me = async () => {
	const res = await api.get("/auth/me");
	return res.data;
};

export const logout = async () => {
	// optional server-side logout
	try {
		await api.post("/auth/logout");
	} catch (e) {
		// ignore
	}
	localStorage.removeItem("token");
	localStorage.removeItem("user");
};
