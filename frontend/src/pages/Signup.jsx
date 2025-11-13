import React, { useState } from "react";
import { signup as apiSignup } from "../api/authAPI";
import { useNavigate } from "react-router-dom";

const Signup = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await apiSignup({ name, email, password });
			navigate("/login");
		} catch (err) {
			console.error(err);
			alert("Signup failed");
		}
	};

	return (
		<div className="p-6 max-w-md mx-auto">
			<h1 className="text-2xl font-bold mb-4">Sign up</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
				<input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
				<button className="px-4 py-2 bg-green-600 text-white rounded">Sign up</button>
			</form>
			</div>
		);
	};

export default Signup;
