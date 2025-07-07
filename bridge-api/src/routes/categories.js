const express = require('express');
const router = express.Router();

// 獲取所有分類
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.category_name as title,
        c.category_description as description,
        c.sort_order,
        c.is_open as status,
        COUNT(p.id) as products_count
      FROM categorys c
      LEFT JOIN products p ON c.id = p.category_id AND p.pd_status = 1
      WHERE c.is_open = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `;
    
    const [categories] = await req.db.execute(query);
    
    // 格式化為Medusa格式
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.title,
      description: category.description,
      handle: category.title.toLowerCase().replace(/\s+/g, '-'),
      is_active: category.status === 1,
      products_count: category.products_count,
      rank: category.sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    res.json({
      product_categories: formattedCategories,
      count: formattedCategories.length
    });
    
  } catch (error) {
    console.error('獲取分類列表失敗:', error);
    res.status(500).json({ error: '獲取分類列表失敗' });
  }
});

// 獲取單個分類詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        c.id,
        c.category_name as title,
        c.category_description as description,
        c.sort_order,
        c.is_open as status,
        COUNT(p.id) as products_count
      FROM categorys c
      LEFT JOIN products p ON c.id = p.category_id AND p.pd_status = 1
      WHERE c.id = ? AND c.is_open = 1
      GROUP BY c.id
    `;
    
    const [categories] = await req.db.execute(query, [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: '分類不存在' });
    }
    
    const category = categories[0];
    
    // 格式化為Medusa格式
    const formattedCategory = {
      id: category.id,
      name: category.title,
      description: category.description,
      handle: category.title.toLowerCase().replace(/\s+/g, '-'),
      is_active: category.status === 1,
      products_count: category.products_count,
      rank: category.sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.json({ product_category: formattedCategory });
    
  } catch (error) {
    console.error('獲取分類詳情失敗:', error);
    res.status(500).json({ error: '獲取分類詳情失敗' });
  }
});

// 獲取分類下的商品
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // 先檢查分類是否存在
    const [categories] = await req.db.execute(
      'SELECT id, category_name FROM categorys WHERE id = ? AND is_open = 1',
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: '分類不存在' });
    }
    
    const category = categories[0];
    
    // 獲取分類下的商品
    const query = `
      SELECT 
        p.id,
        p.pd_name as name,
        p.pd_price as price,
        p.pd_description as description,
        p.picture as image,
        p.in_stock as stock,
        p.sales_count,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.category_id = ? AND p.pd_status = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [products] = await req.db.execute(query, [id, parseInt(limit), offset]);
    
    // 獲取總數
    const [countResult] = await req.db.execute(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND pd_status = 1',
      [id]
    );
    
    const total = countResult[0].total;
    
    // 格式化商品數據
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      thumbnail: product.image,
      status: 'published',
      collection: {
        id: parseInt(id),
        title: category.category_name
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
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
    
    res.json({
      products: formattedProducts,
      count: formattedProducts.length,
      offset: offset,
      limit: parseInt(limit),
      total: total,
      category: {
        id: parseInt(id),
        name: category.category_name
      }
    });
    
  } catch (error) {
    console.error('獲取分類商品失敗:', error);
    res.status(500).json({ error: '獲取分類商品失敗' });
  }
});

module.exports = router; 