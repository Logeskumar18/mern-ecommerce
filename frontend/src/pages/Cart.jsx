import React from "react";
import useCart from "../hooks/useCart";

const Cart = () => {
	const { items, removeItem, clear } = useCart();

	const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Your Cart</h1>
			{items.length === 0 ? (
				<div>Your cart is empty</div>
			) : (
				<div>
					<ul>
						{items.map((it) => (
							<li key={it._id} className="flex items-center justify-between py-2">
								<div>
									<div className="font-semibold">{it.name}</div>
									<div>Qty: {it.qty}</div>
								</div>
								<div>
									<div className="font-bold">₹{(it.price || 0) * (it.qty || 1)}</div>
									<button onClick={() => removeItem(it._id)} className="ml-2 text-sm text-red-600">Remove</button>
								</div>
							</li>
						))}
					</ul>
					<div className="mt-4">Total: ₹{total}</div>
					<div className="mt-4">
						<button onClick={clear} className="px-4 py-2 bg-gray-200 rounded">Clear</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Cart;
