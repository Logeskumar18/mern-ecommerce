import { useState } from "react";

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="position-relative">
      {isLoading && !hasError && (
        <div 
          className={`d-flex align-items-center justify-content-center bg-light ${className}`}
          style={{ minHeight: "200px" }}
        >
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'd-none' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;