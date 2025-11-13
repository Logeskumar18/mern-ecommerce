import { createContext, useEffect, useState } from "react";
import { getCart as apiGetCart } from "../api/cartAPI";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const [items, setItems] = useState(() => {
		try {
			const raw = localStorage.getItem("cart");
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			return [];
		}
	});

	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(items));
	}, [items]);

	const setRemoteCart = async () => {
		try {
			const data = await apiGetCart();
			if (data?.items) setItems(data.items);
		} catch (e) {
			// ignore if not logged in
		}
	};

	const addItem = (product, qty = 1) => {
		setItems((prev) => {
			const exist = prev.find((p) => p._id === product._id);
			if (exist) {
				return prev.map((p) => (p._id === product._id ? { ...p, qty: p.qty + qty } : p));
			}
			return [...prev, { ...product, qty }];
		});
	};

	const removeItem = (productId) => setItems((prev) => prev.filter((p) => p._id !== productId));

	const clear = () => setItems([]);

	return (
		<CartContext.Provider value={{ items, setItems, addItem, removeItem, clear, setRemoteCart }}>
			{children}
		</CartContext.Provider>
	);
};
