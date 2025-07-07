const express = require('express');
const crypto = require('crypto');
const moment = require('moment');
const router = express.Router();

// 創建訂單
router.post('/', async (req, res) => {
  try {
    const { 
      product_id, 
      quantity = 1, 
      customer_email, 
      customer_phone = '',
      payment_method = 'alipay',
      coupon_code = null 
    } = req.body;

    // 驗證商品存在性和庫存
    const [products] = await req.db.execute(
      'SELECT id, pd_name, pd_price, in_stock, pd_status FROM products WHERE id = ? AND pd_status = 1',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(400).json({ error: '商品不存在或已下架' });
    }

    const product = products[0];
    
    // 檢查庫存
    const [availableCards] = await req.db.execute(
      'SELECT COUNT(*) as count FROM cards WHERE product_id = ? AND status = 1',
      [product_id]
    );

    if (availableCards[0].count < quantity) {
      return res.status(400).json({ error: '庫存不足' });
    }

    // 生成訂單號
    const orderNumber = generateOrderNumber();
    
    // 計算價格
    let totalPrice = product.pd_price * quantity;
    let discountAmount = 0;
    
    // 如果有優惠券，計算折扣
    if (coupon_code) {
      const [coupons] = await req.db.execute(
        'SELECT * FROM coupons WHERE code = ? AND status = 1 AND (expire_time IS NULL OR expire_time > NOW())',
        [coupon_code]
      );
      
      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (coupon.type === 'percentage') {
          discountAmount = totalPrice * (coupon.value / 100);
        } else if (coupon.type === 'fixed') {
          discountAmount = Math.min(coupon.value, totalPrice);
        }
        totalPrice -= discountAmount;
      }
    }

    // 創建訂單
    const [orderResult] = await req.db.execute(`
      INSERT INTO orders (
        order_sn, 
        product_id, 
        product_name, 
        product_price, 
        buy_amount, 
        total_price, 
        discount_amount,
        customer_email, 
        customer_phone, 
        pay_way, 
        status, 
        coupon_code,
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      orderNumber,
      product_id,
      product.pd_name,
      product.pd_price,
      quantity,
      totalPrice,
      discountAmount,
      customer_email,
      customer_phone,
      payment_method,
      1, // 待付款
      coupon_code
    ]);

    const orderId = orderResult.insertId;

    // 格式化為Medusa格式的訂單
    const formattedOrder = {
      id: orderId,
      display_id: orderNumber,
      status: 'pending',
      payment_status: 'awaiting',
      fulfillment_status: 'not_fulfilled',
      currency_code: 'CNY',
      total: Math.round(totalPrice * 100), // 轉換為分
      subtotal: Math.round(product.pd_price * quantity * 100),
      discount_total: Math.round(discountAmount * 100),
      items: [{
        id: `${orderId}-${product_id}`,
        title: product.pd_name,
        quantity: quantity,
        unit_price: Math.round(product.pd_price * 100),
        total: Math.round(product.pd_price * quantity * 100),
        variant: {
          id: `${product_id}-default`,
          title: 'Default',
          product_id: product_id
        }
      }],
      billing_address: {
        email: customer_email,
        phone: customer_phone
      },
      shipping_address: {
        email: customer_email,
        phone: customer_phone
      },
      customer: {
        email: customer_email,
        phone: customer_phone
      },
      payment_method: payment_method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      order: formattedOrder,
      payment_url: `/api/payments/${orderId}/create`
    });

  } catch (error) {
    console.error('創建訂單失敗:', error);
    res.status(500).json({ error: '創建訂單失敗' });
  }
});

// 獲取訂單詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await req.db.execute(`
      SELECT 
        o.*,
        p.pd_name as product_name,
        p.picture as product_image
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    const order = orders[0];
    
    // 獲取訂單相關的卡密信息
    const [cards] = await req.db.execute(
      'SELECT card_info FROM cards WHERE order_id = ?',
      [id]
    );

    // 格式化為Medusa格式
    const formattedOrder = {
      id: order.id,
      display_id: order.order_sn,
      status: getOrderStatus(order.status),
      payment_status: getPaymentStatus(order.status),
      fulfillment_status: order.status === 3 ? 'fulfilled' : 'not_fulfilled',
      currency_code: 'CNY',
      total: Math.round(order.total_price * 100),
      subtotal: Math.round(order.product_price * order.buy_amount * 100),
      discount_total: Math.round((order.discount_amount || 0) * 100),
      items: [{
        id: `${order.id}-${order.product_id}`,
        title: order.product_name,
        quantity: order.buy_amount,
        unit_price: Math.round(order.product_price * 100),
        total: Math.round(order.product_price * order.buy_amount * 100),
        variant: {
          id: `${order.product_id}-default`,
          title: 'Default',
          product_id: order.product_id
        },
        thumbnail: order.product_image
      }],
      billing_address: {
        email: order.customer_email,
        phone: order.customer_phone
      },
      customer: {
        email: order.customer_email,
        phone: order.customer_phone
      },
      payment_method: order.pay_way,
      cards: cards.map(card => ({ info: card.card_info })),
      created_at: order.created_at,
      updated_at: order.updated_at
    };

    res.json({ order: formattedOrder });

  } catch (error) {
    console.error('獲取訂單詳情失敗:', error);
    res.status(500).json({ error: '獲取訂單詳情失敗' });
  }
});

// 根據訂單號獲取訂單
router.get('/by-number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const [orders] = await req.db.execute(`
      SELECT 
        o.*,
        p.pd_name as product_name,
        p.picture as product_image
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.order_sn = ?
    `, [orderNumber]);

    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    const order = orders[0];
    
    // 獲取卡密信息
    const [cards] = await req.db.execute(
      'SELECT card_info FROM cards WHERE order_id = ?',
      [order.id]
    );

    const formattedOrder = {
      id: order.id,
      display_id: order.order_sn,
      status: getOrderStatus(order.status),
      payment_status: getPaymentStatus(order.status),
      fulfillment_status: order.status === 3 ? 'fulfilled' : 'not_fulfilled',
      currency_code: 'CNY',
      total: Math.round(order.total_price * 100),
      items: [{
        id: `${order.id}-${order.product_id}`,
        title: order.product_name,
        quantity: order.buy_amount,
        unit_price: Math.round(order.product_price * 100),
        thumbnail: order.product_image
      }],
      customer: {
        email: order.customer_email,
        phone: order.customer_phone
      },
      payment_method: order.pay_way,
      cards: cards.map(card => ({ info: card.card_info })),
      created_at: order.created_at,
      updated_at: order.updated_at
    };

    res.json({ order: formattedOrder });

  } catch (error) {
    console.error('獲取訂單失敗:', error);
    res.status(500).json({ error: '獲取訂單失敗' });
  }
});

// 訂單狀態查詢
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await req.db.execute(
      'SELECT status, order_sn, total_price FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    const order = orders[0];
    
    res.json({
      order_id: id,
      order_number: order.order_sn,
      status: getOrderStatus(order.status),
      payment_status: getPaymentStatus(order.status),
      total: Math.round(order.total_price * 100),
      is_paid: order.status === 3,
      is_fulfilled: order.status === 3
    });

  } catch (error) {
    console.error('查詢訂單狀態失敗:', error);
    res.status(500).json({ error: '查詢訂單狀態失敗' });
  }
});

// 取消訂單
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await req.db.execute(
      'SELECT status FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    const order = orders[0];
    
    if (order.status !== 1) {
      return res.status(400).json({ error: '訂單狀態不允許取消' });
    }

    // 更新訂單狀態為已取消
    await req.db.execute(
      'UPDATE orders SET status = 4, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ message: '訂單已取消' });

  } catch (error) {
    console.error('取消訂單失敗:', error);
    res.status(500).json({ error: '取消訂單失敗' });
  }
});

// 輔助函數：生成訂單號
function generateOrderNumber() {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DJK${timestamp}${random}`;
}

// 輔助函數：獲取訂單狀態
function getOrderStatus(status) {
  const statusMap = {
    1: 'pending',      // 待付款
    2: 'processing',   // 已付款待發貨
    3: 'completed',    // 已完成
    4: 'cancelled',    // 已取消
    5: 'failed'        // 失敗
  };
  return statusMap[status] || 'pending';
}

// 輔助函數：獲取支付狀態
function getPaymentStatus(status) {
  const statusMap = {
    1: 'awaiting',     // 待付款
    2: 'captured',     // 已付款
    3: 'captured',     // 已完成
    4: 'cancelled',    // 已取消
    5: 'failed'        // 失敗
  };
  return statusMap[status] || 'awaiting';
}

module.exports = router; 