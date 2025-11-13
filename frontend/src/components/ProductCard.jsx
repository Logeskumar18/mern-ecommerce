import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
	if (!product) return null;

	return (
		<div className="border rounded p-3">
			<Link to={`/products/${product._id}`}>
				<img src={product.image || "/placeholder.png"} alt={product.name} className="w-full h-48 object-cover" />
				<h3 className="mt-2 font-semibold">{product.name}</h3>
			</Link>
			<div className="mt-2 flex items-center justify-between">
				<span className="text-lg font-bold">₹{product.price}</span>
				<button className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
					</div>
				</div>
			);
		};

export default ProductCard;
