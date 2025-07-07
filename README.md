# 獨角數卡 + Medusa 整合方案

一個現代化的數位商品銷售平台，結合了獨角數卡的強大功能和現代前端技術。

## 🚀 特性

### 核心功能
- **現代化UI**: 基於Next.js + TypeScript的響應式前端
- **多支付方式**: 支持支付寶、微信支付、PayJS等多種支付方式
- **自動發貨**: 商品購買後自動發貨
- **庫存管理**: 實時庫存監控和管理
- **訂單跟蹤**: 完整的訂單生命週期管理
- **分類管理**: 靈活的商品分類系統

### 技術特性
- **前後端分離**: 現代化的架構設計
- **API橋接**: 統一的API接口層
- **Redis快取**: 高性能數據快取
- **響應式設計**: 完美適配各種設備
- **TypeScript**: 類型安全的開發體驗

## 🏗️ 項目結構

```
dujiaoka-medusa/
├── frontend/           # Next.js前端應用
│   ├── src/
│   │   ├── components/ # React組件
│   │   ├── pages/      # 頁面組件
│   │   ├── hooks/      # 自定義Hook
│   │   ├── types/      # TypeScript類型定義
│   │   └── utils/      # 工具函數
│   ├── public/         # 靜態資源
│   └── package.json
├── bridge-api/         # API橋接層
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── services/   # 業務邏輯
│   │   ├── models/     # 數據模型
│   │   └── routes/     # 路由配置
│   └── package.json
├── backend/            # 獨角數卡後端
│   └── (獨角數卡文件)
├── docs/               # 文檔
│   └── installation.md # 安裝指南
└── package.json        # 根目錄配置
```

## 🛠️ 技術棧

### 前端
- **Next.js 14**: React框架
- **TypeScript**: 類型安全
- **Tailwind CSS**: 樣式框架
- **React Query**: 數據獲取和快取
- **Axios**: HTTP客戶端

### 後端
- **Node.js**: JavaScript運行時
- **Express.js**: Web框架
- **MySQL**: 關係型資料庫
- **Redis**: 記憶體資料庫
- **PHP**: 獨角數卡後端語言

### 部署
- **Nginx**: 反向代理和負載均衡
- **PM2**: 進程管理
- **Docker**: 容器化部署（可選）

## 📦 快速開始

### 1. 克隆項目
```bash
git clone https://github.com/your-username/dujiaoka-medusa.git
cd dujiaoka-medusa
```

### 2. 安裝依賴
```bash
npm run install:all
```

### 3. 配置環境變數
```bash
# 複製環境變數模板
cp bridge-api/.env.example bridge-api/.env
cp frontend/.env.local.example frontend/.env.local

# 編輯配置文件
# 配置資料庫、Redis、支付接口等
```

### 4. 啟動開發服務
```bash
npm run dev
```

### 5. 訪問應用
- 前端: http://localhost:3000
- API: http://localhost:3001
- 後台: http://localhost/admin

詳細安裝指南請查看 [安裝文檔](docs/installation.md)

## 🎯 使用場景

### 適用於
- 數位商品銷售（軟體、遊戲、會員等）
- 虛擬商品交易平台
- 自動化銷售系統
- 小型電商平台

### 支持的商品類型
- 軟體授權碼
- 遊戲點數卡
- 會員賬號
- 數位內容
- 虛擬商品

## 💳 支付方式

### 已支持
- **支付寶**: 掃碼支付、手機支付
- **微信支付**: 掃碼支付、公眾號支付
- **PayJS**: 聚合支付
- **銀行卡**: 在線支付

### 即將支持
- **PayPal**: 國際支付
- **加密貨幣**: 比特幣、以太坊等
- **其他**: 更多支付方式

## 🔒 安全特性

- **數據加密**: 敏感數據加密存儲
- **支付安全**: 多重支付驗證
- **訪問控制**: 基於角色的權限管理
- **審計日誌**: 完整的操作記錄
- **防刷機制**: 防止惡意刷單

## 📈 性能優化

- **Redis快取**: 提高數據讀取速度
- **CDN支持**: 靜態資源加速
- **圖片優化**: 自動壓縮和格式轉換
- **懶加載**: 按需加載組件
- **代碼分割**: 減少初始加載時間

## 🤝 貢獻指南

歡迎貢獻代碼！請遵循以下步驟：

1. Fork本項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 創建Pull Request

## 📋 開發計劃

### v1.0 (當前)
- [x] 基礎架構搭建
- [x] 前端組件開發
- [x] API橋接層
- [x] 支付集成
- [ ] 測試和優化

### v1.1 (計劃中)
- [ ] 管理後台重構
- [ ] 多語言支持
- [ ] 移動端App
- [ ] 更多支付方式

### v2.0 (規劃中)
- [ ] 微服務架構
- [ ] 分布式部署
- [ ] 大數據分析
- [ ] AI推薦系統

## 📄 許可證

本項目基於 MIT 許可證開源 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🙏 致謝

- [獨角數卡](https://github.com/assimon/dujiaoka) - 提供強大的後端支持
- [Next.js](https://nextjs.org/) - 優秀的React框架
- [Tailwind CSS](https://tailwindcss.com/) - 實用的CSS框架

## 📞 聯繫我們

- **GitHub**: [項目地址](https://github.com/your-username/dujiaoka-medusa)
- **Email**: your-email@example.com
- **QQ群**: 123456789

---

⭐ 如果這個項目對你有幫助，請給我們一個星星！

**免責聲明**: 本項目僅用於學習和研究目的，請遵守當地法律法規。 