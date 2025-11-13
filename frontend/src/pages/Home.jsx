import React from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";

const Home = () => {
		const { products, loading } = useProducts();

		const list = Array.isArray(products) ? products : (products?.products || products?.items || []);

		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">Featured Products</h1>
				{loading ? (
					<div>Loading...</div>
				) : (
					<div className="grid grid-cols-3 gap-4">
						{list.map((p) => (
							<ProductCard key={p._id || p.id} product={p} />
						))}
					</div>
				)}
			</div>
		);
};

export default Home;
