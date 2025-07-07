import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = '獨角數卡商城' }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-gray-900">
                獨角數卡商城
              </a>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">
                首頁
              </a>
              <a href="/products" className="text-gray-500 hover:text-gray-900">
                商品
              </a>
              <a href="/categories" className="text-gray-500 hover:text-gray-900">
                分類
              </a>
              <a href="/about" className="text-gray-500 hover:text-gray-900">
                關於我們
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                登入
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">獨角數卡商城</h3>
              <p className="text-gray-400">
                現代化數位商品銷售平台，提供安全、快速的購物體驗。
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">快速連結</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">首頁</a></li>
                <li><a href="/products" className="hover:text-white">商品</a></li>
                <li><a href="/categories" className="hover:text-white">分類</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">客戶服務</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">幫助中心</a></li>
                <li><a href="/contact" className="hover:text-white">聯絡我們</a></li>
                <li><a href="/faq" className="hover:text-white">常見問題</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">支付方式</h4>
              <div className="flex space-x-2">
                <div className="bg-gray-700 px-3 py-1 rounded text-sm">支付寶</div>
                <div className="bg-gray-700 px-3 py-1 rounded text-sm">微信</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 獨角數卡商城. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 