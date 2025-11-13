import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
	const { user, logout } = useContext(AuthContext);
	const { items } = useContext(CartContext);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<nav className="px-4 py-3 bg-gray-800 text-white flex items-center justify-between">
			<Link to="/" className="text-xl font-bold">
				MERN Shop
			</Link>
			<div className="flex items-center gap-4">
				<Link to="/products">Products</Link>
				<Link to="/cart">Cart ({items.length})</Link>
				{user ? (
					<>
						<span>Hello, {user.name || user.email}</span>
						<button onClick={handleLogout} className="ml-2 underline">
							Logout
						</button>
					</>
				) : (
					<Link to="/login">Login</Link>
				)}
			</div>
			</nav>
		);
	};

export default Navbar;
