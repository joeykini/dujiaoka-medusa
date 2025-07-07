import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Product, Category } from '../types';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useProducts({
    page: currentPage,
    category_id: selectedCategory,
    search: searchTerm
  });
  
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading 
  } = useCategories();

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Head>
        <title>獨角數卡 - 數字商品自動發貨平台</title>
        <meta name="description" content="專業的數字商品自動發貨平台，支持多種支付方式" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {/* 英雄區域 */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              獨角數卡
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
              專業的數字商品自動發貨平台
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </section>

        {/* 主要內容 */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 側邊欄 - 分類篩選 */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <CategoryFilter
                    categories={categoriesData?.product_categories || []}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    loading={categoriesLoading}
                  />
                </div>
              </aside>

              {/* 主要內容區域 */}
              <main className="flex-1">
                {/* 結果統計 */}
                {productsData && (
                  <div className="mb-6 text-gray-600">
                    共找到 {productsData.total} 個商品
                    {selectedCategory && (
                      <span className="ml-2 text-primary-600">
                        · {categoriesData?.product_categories.find(c => c.id.toString() === selectedCategory)?.name}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="ml-2 text-primary-600">
                        · 搜索: "{searchTerm}"
                      </span>
                    )}
                  </div>
                )}

                {/* 商品網格 */}
                {productsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                        <div className="bg-gray-200 rounded h-4 mb-2"></div>
                        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : productsError ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 text-lg mb-4">載入商品時出錯</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      重新載入
                    </button>
                  </div>
                ) : !productsData?.products.length ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">
                      {searchTerm || selectedCategory ? '沒有找到符合條件的商品' : '暫無商品'}
                    </div>
                    {(searchTerm || selectedCategory) && (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('');
                        }}
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        清除篩選條件
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {productsData.products.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* 分頁 */}
                    {productsData.total > productsData.limit && (
                      <div className="flex justify-center">
                        <nav className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            上一頁
                          </button>
                          
                          {[...Array(Math.ceil(productsData.total / productsData.limit))].map((_, index) => {
                            const page = index + 1;
                            if (
                              page === 1 ||
                              page === Math.ceil(productsData.total / productsData.limit) ||
                              (page >= currentPage - 2 && page <= currentPage + 2)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-4 py-2 rounded-lg transition-colors ${
                                    page === currentPage
                                      ? 'bg-primary-600 text-white'
                                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 3 ||
                              page === currentPage + 3
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(productsData.total / productsData.limit)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            下一頁
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
} 