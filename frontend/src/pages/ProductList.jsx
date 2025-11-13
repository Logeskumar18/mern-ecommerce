import React from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";

const ProductList = () => {
	const { products, loading } = useProducts();

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">All Products</h1>
			{loading ? (
				<div>Loading...</div>
			) : (
				<div className="grid grid-cols-3 gap-4">
					{products.map((p) => (
						<ProductCard key={p._id} product={p} />
					))}
				</div>
			)}
		</div>
	);
};

export default ProductList;
