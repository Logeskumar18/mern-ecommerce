import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import ImageWithFallback from "./ImageWithFallback";

const ProductCard = ({ product, className = "" }) => {
	const { addToCart } = useContext(CartContext);
	const { isDarkMode } = useTheme();
	const [isLoading, setIsLoading] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	if (!product) return null;

	const handleAddToCart = async () => {
		setIsLoading(true);
		try {
			await addToCart(product);
			
			// Add visual feedback
			setTimeout(() => {
				setIsLoading(false);
			}, 500);
		} catch (error) {
			console.error("Error adding to cart:", error);
			setIsLoading(false);
		}
	};

	return (
		<div 
			className={`card h-100 border-0 shadow-sm product-card gpu-accelerated ${className} ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
				transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
				boxShadow: isHovered 
					? '0 20px 40px rgba(0, 0, 0, 0.15)' 
					: '0 2px 10px rgba(0, 0, 0, 0.1)'
			}}
		>
			<div className="position-relative overflow-hidden">
				<Link to={`/products/${product._id}`} className="text-decoration-none">
					<div className="image-container" style={{ height: '200px' }}>
						<ImageWithFallback 
							src={product.images?.[0]} 
							alt={product.name} 
							className="card-img-top w-100 h-100" 
							style={{ 
								objectFit: "cover",
								transition: 'transform 0.3s ease, filter 0.3s ease',
								transform: isHovered ? 'scale(1.1)' : 'scale(1)',
								filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
							}}
						/>
					</div>
				</Link>
				
				{/* Quick Action Overlay */}
				<div 
					className={`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 ${
						isHovered ? 'opacity-100' : 'opacity-0'
					}`}
					style={{
						transition: 'opacity 0.3s ease',
						pointerEvents: isHovered ? 'auto' : 'none'
					}}
				>
					<Link 
						to={`/products/${product._id}`}
						className="btn btn-light btn-sm me-2 animate__animated animate__bounceIn"
						style={{ animationDelay: '0.1s' }}
					>
						<i className="fas fa-eye me-1"></i> Quick View
					</Link>
				</div>
			</div>
			
			<div className="card-body d-flex flex-column">
				<Link to={`/products/${product._id}`} className="text-decoration-none">
					<h5 className={`card-title mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{
						fontSize: '1rem',
						fontWeight: '600',
						lineHeight: '1.3',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden'
					}}>
						{product.name}
					</h5>
				</Link>
				
				{product.description && (
					<p className={`card-text small ${isDarkMode ? 'text-light' : 'text-muted'} mb-3`} style={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden'
					}}>
						{product.description}
					</p>
				)}
				
				<div className="mt-auto">
					<div className="d-flex align-items-center justify-content-between mb-3">
						<div>
							<span className="h5 fw-bold text-primary mb-0">₹{product.price}</span>
							{product.originalPrice && product.originalPrice > product.price && (
								<span className="text-muted text-decoration-line-through small ms-2">
									₹{product.originalPrice}
								</span>
							)}
						</div>
						{product.stock !== undefined && (
							<small className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
								{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
							</small>
						)}
					</div>
					
					<div className="d-flex gap-2">
						<Link 
							to={`/products/${product._id}`}
							className="btn btn-outline-primary btn-sm flex-grow-1"
							style={{ transition: 'all 0.2s ease' }}
						>
							<i className="fas fa-eye me-1"></i> View Details
						</Link>
						<button 
							className={`btn btn-primary btn-sm flex-grow-1 ${isLoading ? 'disabled' : ''}`}
							onClick={handleAddToCart}
							disabled={isLoading || (product.stock !== undefined && product.stock === 0)}
							style={{ 
								transition: 'all 0.2s ease',
								position: 'relative',
								overflow: 'hidden'
							}}
						>
							{isLoading ? (
								<>
									<span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
									Adding...
								</>
							) : (
								<>
									<i className="fas fa-shopping-cart me-1"></i> Add to Cart
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
