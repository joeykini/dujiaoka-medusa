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
      <div className="space-y-8">
        {/* 歡迎橫幅 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">歡迎來到獨角數卡商城</h1>
          <p className="text-xl opacity-90">
            安全、快速、便捷的數位商品購買平台
          </p>
        </div>

        {/* 搜索欄 */}
        <SearchBar onSearch={handleSearch} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 側邊欄 - 分類篩選 */}
          <div className="lg:col-span-1">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* 主要內容 - 商品列表 */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                熱門商品
              </h2>
              <span className="text-gray-500">
                共 {filteredProducts.length} 件商品
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">
                  {searchQuery ? '沒有找到匹配的商品' : '暫無商品'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 特色功能 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            為什麼選擇我們？
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">安全可靠</h4>
              <p className="text-gray-600">採用最高級別的安全加密技術，保障您的交易安全</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">極速交付</h4>
              <p className="text-gray-600">自動化處理系統，購買後立即發貨，無需等待</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">24/7 客服</h4>
              <p className="text-gray-600">全天候客戶服務，隨時為您解答疑問</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 