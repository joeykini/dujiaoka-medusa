import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = '獨角數卡商城' }) => {
  return (
    <div>
      {/* 導航欄 */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="logo">
              獨角數卡商城
            </div>
            <ul className="nav-links">
              <li><a href="/">首頁</a></li>
              <li><a href="/products">商品</a></li>
              <li><a href="/categories">分類</a></li>
              <li><a href="/orders">訂單</a></li>
              <li><a href="/login">登入</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      {/* 頁腳 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 獨角數卡商城. 版權所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 