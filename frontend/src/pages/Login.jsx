import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/authAPI";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await apiLogin({ email, password });
			if (data.token) {
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));
				login(data.user);
				navigate("/");
			}
		} catch (err) {
			console.error(err);
			alert("Login failed");
		}
	};

	return (
		<div className="p-6 max-w-md mx-auto">
			<h1 className="text-2xl font-bold mb-4">Login</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
				<input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
				<button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
			</form>
		</div>
	);
};

export default Login;
