import { createContext, useEffect, useState } from "react";
import { fetchProducts } from "../api/productAPI";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	const normalizeProducts = (data) => {
		if (!data) return [];
		if (Array.isArray(data)) return data;
		if (Array.isArray(data.products)) return data.products;
		if (Array.isArray(data.items)) return data.items;
		return [];
	};

	const load = async (params = {}) => {
		setLoading(true);
		try {
			const data = await fetchProducts(params);
			setProducts(normalizeProducts(data));
		} catch (e) {
			console.error(e);
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<ProductContext.Provider value={{ products, loading, refresh: load }}>
			{children}
		</ProductContext.Provider>
	);
};
