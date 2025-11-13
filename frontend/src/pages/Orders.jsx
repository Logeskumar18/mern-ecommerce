import React, { useEffect, useState } from "react";
import { fetchOrders } from "../api/orderAPI";

const Orders = () => {
	const [orders, setOrders] = useState([]);

	useEffect(() => {
		const load = async () => {
			const data = await fetchOrders();
			setOrders(data.orders || data || []);
		};
		load();
	}, []);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Your Orders</h1>
			{orders.length === 0 ? (
				<div>No orders yet.</div>
			) : (
				<ul>
					{orders.map((o) => (
						<li key={o._id} className="mb-3 border p-3 rounded">
							<div>Order #{o._id}</div>
							<div>Total: ₹{o.total}</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Orders;
