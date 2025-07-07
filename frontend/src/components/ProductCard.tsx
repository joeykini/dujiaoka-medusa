import React from 'react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    status?: string;
    sales_count?: number;
  };
  onAddToCart: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} />
        ) : (
          <span>暫無圖片</span>
        )}
      </div>
      
      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-price">
          ¥{product.price.toFixed(2)}
        </div>
        
        <div className="product-meta">
          <span>已售 {product.sales_count || 0}</span>
          {product.status && (
            <span className={`product-status ${product.status === 'hot' ? 'status-hot' : 'status-normal'}`}>
              {product.status === 'hot' ? '熱銷' : '正常'}
            </span>
          )}
        </div>
        
        <button 
          className="btn btn-primary btn-full"
          onClick={() => onAddToCart(product)}
        >
          立即購買
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 