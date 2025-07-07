const express = require('express');
const router = express.Router();

// 獲取所有商品列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category_id, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.id,
        p.pd_name as name,
        p.pd_price as price,
        p.pd_description as description,
        p.picture as image,
        p.in_stock as stock,
        p.sales_count,
        p.pd_status as status,
        c.category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN categorys c ON p.category_id = c.id
      WHERE p.pd_status = 1
    `;
    
    const queryParams = [];
    
    // 分類篩選
    if (category_id) {
      query += ' AND p.category_id = ?';
      queryParams.push(category_id);
    }
    
    // 搜索功能
    if (search) {
      query += ' AND (p.pd_name LIKE ? OR p.pd_description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // 排序和分頁
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [products] = await req.db.execute(query, queryParams);
    
    // 獲取總數
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      WHERE p.pd_status = 1
    `;
    
    const countParams = [];
    if (category_id) {
      countQuery += ' AND p.category_id = ?';
      countParams.push(category_id);
    }
    
    if (search) {
      countQuery += ' AND (p.pd_name LIKE ? OR p.pd_description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await req.db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    // 格式化商品數據為Medusa格式
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      thumbnail: product.image,
      status: product.status === 1 ? 'published' : 'draft',
      collection: {
        id: product.category_id,
        title: product.category_name
      },
      variants: [{
        id: `${product.id}-default`,
        title: 'Default',
        prices: [{
          currency_code: 'CNY',
          amount: Math.round(product.price * 100) // 轉換為分
        }],
        inventory_quantity: product.stock
      }],
      sales_count: product.sales_count || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    res.json({
      products: formattedProducts,
      count: formattedProducts.length,
      offset: offset,
      limit: parseInt(limit),
      total: total
    });
    
  } catch (error) {
    console.error('獲取商品列表失敗:', error);
    res.status(500).json({ error: '獲取商品列表失敗' });
  }
});

// 獲取單個商品詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.id,
        p.pd_name as name,
        p.pd_price as price,
        p.pd_description as description,
        p.picture as image,
        p.in_stock as stock,
        p.sales_count,
        p.pd_status as status,
        p.buy_limit_num,
        p.retail_price,
        p.wholesale_price,
        p.wholesale_price_cnf,
        c.category_name,
        c.id as category_id,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categorys c ON p.category_id = c.id
      WHERE p.id = ? AND p.pd_status = 1
    `;
    
    const [products] = await req.db.execute(query, [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    const product = products[0];
    
    // 格式化為Medusa格式
    const formattedProduct = {
      id: product.id,
      title: product.name,
      description: product.description,
      thumbnail: product.image,
      status: product.status === 1 ? 'published' : 'draft',
      collection: {
        id: product.category_id,
        title: product.category_name
      },
      variants: [{
        id: `${product.id}-default`,
        title: 'Default',
        prices: [{
          currency_code: 'CNY',
          amount: Math.round(product.price * 100)
        }],
        inventory_quantity: product.stock
      }],
      sales_count: product.sales_count || 0,
      buy_limit: product.buy_limit_num,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      wholesale_config: product.wholesale_price_cnf,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
    
    res.json({ product: formattedProduct });
    
  } catch (error) {
    console.error('獲取商品詳情失敗:', error);
    res.status(500).json({ error: '獲取商品詳情失敗' });
  }
});

// 檢查商品庫存
router.get('/:id/inventory', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.in_stock as stock,
        p.pd_status as status,
        COUNT(c.id) as available_cards
      FROM products p
      LEFT JOIN cards c ON p.id = c.product_id AND c.status = 1
      WHERE p.id = ?
      GROUP BY p.id
    `;
    
    const [result] = await req.db.execute(query, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    const inventory = result[0];
    
    res.json({
      product_id: id,
      stock: inventory.stock,
      available_cards: inventory.available_cards || 0,
      is_available: inventory.status === 1 && inventory.available_cards > 0
    });
    
  } catch (error) {
    console.error('檢查庫存失敗:', error);
    res.status(500).json({ error: '檢查庫存失敗' });
  }
});

// 獲取熱門商品
router.get('/featured/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT 
        p.id,
        p.pd_name as name,
        p.pd_price as price,
        p.pd_description as description,
        p.picture as image,
        p.in_stock as stock,
        p.sales_count,
        c.category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN categorys c ON p.category_id = c.id
      WHERE p.pd_status = 1
      ORDER BY p.sales_count DESC, p.created_at DESC
      LIMIT ?
    `;
    
    const [products] = await req.db.execute(query, [parseInt(limit)]);
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      thumbnail: product.image,
      collection: {
        id: product.category_id,
        title: product.category_name
      },
      variants: [{
        id: `${product.id}-default`,
        prices: [{
          currency_code: 'CNY',
          amount: Math.round(product.price * 100)
        }]
      }],
      sales_count: product.sales_count || 0
    }));
    
    res.json({ products: formattedProducts });
    
  } catch (error) {
    console.error('獲取熱門商品失敗:', error);
    res.status(500).json({ error: '獲取熱門商品失敗' });
  }
});

module.exports = router; 