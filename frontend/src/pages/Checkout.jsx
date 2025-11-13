import React from "react";
import useCart from "../hooks/useCart";
import { createOrder } from "../api/orderAPI";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
	const { items, clear } = useCart();
	const navigate = useNavigate();
	const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

	const handlePlaceOrder = async () => {
		try {
			const data = await createOrder({ items, total });
			clear();
			navigate(`/orders`);
		} catch (e) {
			console.error(e);
			alert("Order failed");
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Checkout</h1>
			<div>Total: ₹{total}</div>
			<button onClick={handlePlaceOrder} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Place Order</button>
		</div>
	);
};

export default Checkout;
