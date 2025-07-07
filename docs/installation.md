# 獨角數卡 + Medusa 整合方案 - 安裝指南

## 系統要求

### 基礎環境
- **Node.js**: 18.0+ 
- **PHP**: 7.4+
- **MySQL**: 5.6+
- **Redis**: 最新穩定版
- **Nginx**: 1.16+

### PHP擴展要求
- `fileinfo` (必須)
- `redis` (必須)
- `mysqli` 或 `pdo_mysql`
- `curl`
- `json`
- `openssl`
- `mbstring`

## 安裝步驟

### 1. 克隆項目
```bash
git clone https://github.com/your-username/dujiaoka-medusa.git
cd dujiaoka-medusa
```

### 2. 安裝依賴

#### 安裝根目錄依賴
```bash
npm install
```

#### 安裝前端依賴
```bash
cd frontend
npm install
cd ..
```

#### 安裝API橋接層依賴
```bash
cd bridge-api
npm install
cd ..
```

#### 安裝獨角數卡後端依賴
```bash
cd backend
composer install
cd ..
```

### 3. 配置環境變數

#### 配置API橋接層
```bash
cd bridge-api
cp .env.example .env
```

編輯 `.env` 文件：
```env
# 基本配置
PORT=3001
NODE_ENV=production

# 資料庫配置
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=dujiaoka

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# 支付配置（根據需要配置）
PAYJS_MCHID=your_payjs_mchid
PAYJS_KEY=your_payjs_key
PAYJS_NOTIFY_URL=https://your-domain.com/api/payments/callback/payjs
PAYJS_RETURN_URL=https://your-domain.com/payment/success

# 其他支付方式配置...
```

#### 配置前端
```bash
cd frontend
cp .env.local.example .env.local
```

編輯 `.env.local` 文件：
```env
BRIDGE_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 4. 設置獨角數卡後端

#### 下載獨角數卡
```bash
cd backend
wget https://github.com/assimon/dujiaoka/releases/latest/download/dujiaoka.tar.gz
tar -xzf dujiaoka.tar.gz
```

#### 配置獨角數卡
```bash
cp .env.example .env
```

編輯獨角數卡的 `.env` 文件，配置資料庫和支付接口。

#### 運行遷移
```bash
php artisan migrate
php artisan db:seed
```

### 5. 配置資料庫

#### 創建資料庫
```sql
CREATE DATABASE dujiaoka CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 導入獨角數卡資料庫結構
```bash
cd backend
php artisan migrate
```

### 6. 配置Web服務器

#### Nginx配置示例
```nginx
# 前端配置
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API橋接層
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 獨角數卡後台
    location /admin/ {
        root /path/to/backend/public;
        index index.php;
        try_files $uri $uri/ /index.php?$query_string;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }
}
```

### 7. 啟動服務

#### 開發模式
```bash
# 啟動所有服務
npm run dev
```

#### 生產模式
```bash
# 構建前端
npm run build

# 啟動服務
npm run start
```

#### 使用PM2管理進程（推薦）
```bash
# 安裝PM2
npm install -g pm2

# 啟動API橋接層
cd bridge-api
pm2 start src/index.js --name "dujiaoka-bridge"

# 啟動前端
cd ../frontend
pm2 start npm --name "dujiaoka-frontend" -- start

# 保存PM2配置
pm2 save
pm2 startup
```

## 配置支付接口

### 1. PayJS配置
在 `bridge-api/.env` 中配置：
```env
PAYJS_MCHID=your_mchid
PAYJS_KEY=your_key
PAYJS_NOTIFY_URL=https://your-domain.com/api/payments/callback/payjs
PAYJS_RETURN_URL=https://your-domain.com/payment/success
```

### 2. 支付寶配置
```env
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key
```

### 3. 微信支付配置
```env
WECHAT_APP_ID=your_app_id
WECHAT_MCH_ID=your_mch_id
WECHAT_API_KEY=your_api_key
```

## 常見問題

### 1. 端口衝突
- 前端默認端口：3000
- API橋接層默認端口：3001
- 如有衝突，請修改對應的配置文件

### 2. 資料庫連接失敗
- 檢查MySQL服務是否運行
- 確認資料庫用戶權限
- 檢查防火牆設置

### 3. Redis連接失敗
- 確認Redis服務運行狀態
- 檢查Redis配置文件
- 確認密碼設置

### 4. 支付回調失敗
- 確認回調URL可以公網訪問
- 檢查Nginx配置
- 查看API橋接層日誌

## 安全建議

1. **使用HTTPS**: 生產環境必須使用SSL證書
2. **防火牆設置**: 只開放必要端口
3. **定期更新**: 保持依賴包最新版本
4. **備份數據**: 定期備份資料庫和重要文件
5. **監控日誌**: 設置日誌監控和告警

## 維護

### 日誌查看
```bash
# PM2日誌
pm2 logs

# Nginx日誌
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 更新部署
```bash
# 拉取最新代碼
git pull origin main

# 重新安裝依賴
npm run install:all

# 重新構建
npm run build

# 重啟服務
pm2 restart all
```

## 技術支持

如果遇到問題，請：
1. 查看項目文檔
2. 檢查日誌文件
3. 在GitHub提交Issue
4. 加入技術交流群

---

**注意**: 本項目僅用於學習交流，請遵守相關法律法規。 