import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProduct } from "../api/productAPI";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductDetail = () => {
	const { id } = useParams();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const { addItem } = useContext(CartContext);

	useEffect(() => {
		const load = async () => {
			try {
				const data = await fetchProduct(id);
				setProduct(data);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	if (loading) return <div className="p-6">Loading...</div>;
	if (!product) return <div className="p-6">Product not found</div>;

	return (
		<div className="p-6 grid grid-cols-2 gap-6">
			<img src={product.image || "/placeholder.png"} alt={product.name} className="w-full h-96 object-cover" />
			<div>
				<h1 className="text-2xl font-bold">{product.name}</h1>
				<p className="mt-2">{product.description}</p>
				<div className="mt-4 text-xl font-semibold">₹{product.price}</div>
				<button onClick={() => addItem(product, 1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Add to cart</button>
					</div>
				</div>
			);
		};

export default ProductDetail;
