import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';

// 模擬數據
const mockProducts = [
  {
    id: '1',
    title: '數位遊戲點數卡',
    description: '適用於各種遊戲平台的點數卡，支持多種面額選擇',
    thumbnail: '/images/game-card.jpg',
    price: 50.00,
    status: 'hot',
    sales_count: 1234,
  },
  {
    id: '2',
    title: '軟體授權碼',
    description: '正版軟體授權，永久使用，支持多平台',
    thumbnail: '/images/software.jpg',
    price: 299.99,
    status: 'normal',
    sales_count: 567,
  },
  {
    id: '3',
    title: '會員訂閱服務',
    description: '高級會員服務，享受更多特權和功能',
    thumbnail: '/images/membership.jpg',
    price: 99.99,
    status: 'normal',
    sales_count: 890,
  },
];

const mockCategories = [
  { id: '1', name: '遊戲點數', count: 15 },
  { id: '2', name: '軟體授權', count: 8 },
  { id: '3', name: '會員服務', count: 12 },
  { id: '4', name: '數位內容', count: 6 },
];

export default function Home() {
  const [products, setProducts] = useState(mockProducts);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 篩選商品
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 這裡可以根據 selectedCategory 進行篩選
    // 目前為演示，所有商品都顯示
    return matchesSearch;
  });

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToCart = (product: any) => {
    alert(`已添加到購物車: ${product.title}`);
  };

  return (
    <Layout title="首頁 - 獨角數卡商城">
      <div>
        {/* 歡迎橫幅 */}
        <div className="hero-banner">
          <h1 className="hero-title">歡迎來到獨角數卡商城</h1>
          <p className="hero-subtitle">
            安全、快速、便捷的數位商品購買平台
          </p>
        </div>

        {/* 搜索欄 */}
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="layout-grid">
          {/* 側邊欄 - 分類篩選 */}
          <div className="sidebar">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* 主要內容 - 商品列表 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a202c' }}>
                熱門商品
              </h2>
              <span style={{ color: '#6b7280' }}>
                共 {filteredProducts.length} 件商品
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                  {searchQuery ? '沒有找到匹配的商品' : '暫無商品'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 特色功能 */}
        <div className="features-section">
          <h3 className="features-title">
            為什麼選擇我們？
          </h3>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon blue">
                🔒
              </div>
              <h4 className="feature-title">安全可靠</h4>
              <p className="feature-description">採用最高級別的安全加密技術，保障您的交易安全</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon green">
                ⚡
              </div>
              <h4 className="feature-title">極速交付</h4>
              <p className="feature-description">自動化處理系統，購買後立即發貨，無需等待</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon purple">
                🎧
              </div>
              <h4 className="feature-title">24/7 客服</h4>
              <p className="feature-description">全天候客戶服務，隨時為您解答疑問</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 