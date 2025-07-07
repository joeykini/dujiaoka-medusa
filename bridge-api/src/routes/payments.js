const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const router = express.Router();

// 創建支付
router.post('/:orderId/create', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_method = 'alipay', return_url, notify_url } = req.body;

    // 獲取訂單信息
    const [orders] = await req.db.execute(
      'SELECT * FROM orders WHERE id = ? AND status = 1',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在或狀態不正確' });
    }

    const order = orders[0];

    // 根據支付方式創建支付
    let paymentResult;
    switch (payment_method) {
      case 'alipay':
        paymentResult = await createAlipayPayment(order, return_url, notify_url);
        break;
      case 'wechat':
        paymentResult = await createWechatPayment(order, return_url, notify_url);
        break;
      case 'payjs':
        paymentResult = await createPayjsPayment(order, return_url, notify_url);
        break;
      case 'codepay':
        paymentResult = await createCodepayPayment(order, return_url, notify_url);
        break;
      default:
        return res.status(400).json({ error: '不支持的支付方式' });
    }

    // 更新訂單支付信息
    await req.db.execute(
      'UPDATE orders SET pay_way = ?, trade_no = ?, updated_at = NOW() WHERE id = ?',
      [payment_method, paymentResult.trade_no || '', orderId]
    );

    res.json({
      payment_id: paymentResult.payment_id,
      payment_url: paymentResult.payment_url,
      qr_code: paymentResult.qr_code,
      trade_no: paymentResult.trade_no,
      total_amount: order.total_price,
      currency: 'CNY',
      payment_method: payment_method,
      expires_at: paymentResult.expires_at
    });

  } catch (error) {
    console.error('創建支付失敗:', error);
    res.status(500).json({ error: '創建支付失敗' });
  }
});

// 支付回調處理
router.post('/callback/:method', async (req, res) => {
  try {
    const { method } = req.params;
    
    let result;
    switch (method) {
      case 'alipay':
        result = await handleAlipayCallback(req.body);
        break;
      case 'wechat':
        result = await handleWechatCallback(req.body);
        break;
      case 'payjs':
        result = await handlePayjsCallback(req.body);
        break;
      case 'codepay':
        result = await handleCodepayCallback(req.body);
        break;
      default:
        return res.status(400).json({ error: '不支持的支付方式' });
    }

    if (result.success) {
      await processPaymentSuccess(result.order_id, result.trade_no, result.amount);
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ error: '支付驗證失敗' });
    }

  } catch (error) {
    console.error('支付回調處理失敗:', error);
    res.status(500).json({ error: '支付回調處理失敗' });
  }
});

// 查詢支付狀態
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const [orders] = await req.db.execute(
      'SELECT status, trade_no, total_price, pay_way FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    const order = orders[0];
    
    res.json({
      order_id: orderId,
      payment_status: order.status === 3 ? 'paid' : 'pending',
      trade_no: order.trade_no,
      total_amount: order.total_price,
      payment_method: order.pay_way,
      is_paid: order.status === 3
    });

  } catch (error) {
    console.error('查詢支付狀態失敗:', error);
    res.status(500).json({ error: '查詢支付狀態失敗' });
  }
});

// 支付寶支付創建
async function createAlipayPayment(order, return_url, notify_url) {
  // 這裡需要根據實際的支付寶配置來實現
  // 示例實現
  const payment_id = generatePaymentId();
  const payment_url = `https://your-alipay-gateway.com/pay?id=${payment_id}`;
  
  return {
    payment_id,
    payment_url,
    qr_code: payment_url,
    trade_no: payment_id,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分鐘後過期
  };
}

// 微信支付創建
async function createWechatPayment(order, return_url, notify_url) {
  const payment_id = generatePaymentId();
  const payment_url = `https://your-wechat-gateway.com/pay?id=${payment_id}`;
  
  return {
    payment_id,
    payment_url,
    qr_code: payment_url,
    trade_no: payment_id,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  };
}

// PayJS支付創建
async function createPayjsPayment(order, return_url, notify_url) {
  const payment_id = generatePaymentId();
  const payment_url = `https://payjs.cn/api/native`;
  
  // PayJS API調用示例
  const params = {
    mchid: process.env.PAYJS_MCHID,
    total_fee: Math.round(order.total_price * 100),
    out_trade_no: order.order_sn,
    body: order.product_name,
    notify_url: notify_url || process.env.PAYJS_NOTIFY_URL,
    return_url: return_url || process.env.PAYJS_RETURN_URL
  };
  
  // 生成簽名
  const sign = generatePayjsSign(params);
  params.sign = sign;
  
  try {
    const response = await axios.post(payment_url, params);
    return {
      payment_id: response.data.payjs_order_id,
      payment_url: response.data.code_url,
      qr_code: response.data.qrcode,
      trade_no: response.data.payjs_order_id,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('PayJS支付創建失敗:', error);
    throw error;
  }
}

// 碼支付創建
async function createCodepayPayment(order, return_url, notify_url) {
  const payment_id = generatePaymentId();
  
  // 碼支付API調用示例
  const params = {
    id: process.env.CODEPAY_ID,
    pay_id: order.order_sn,
    type: 1, // 支付寶
    price: order.total_price,
    param: order.id,
    notify_url: notify_url || process.env.CODEPAY_NOTIFY_URL,
    return_url: return_url || process.env.CODEPAY_RETURN_URL
  };
  
  const sign = generateCodepaySign(params);
  params.sign = sign;
  
  const payment_url = `${process.env.CODEPAY_API_URL}/creat_order/?${new URLSearchParams(params)}`;
  
  return {
    payment_id,
    payment_url,
    qr_code: payment_url,
    trade_no: payment_id,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  };
}

// 處理支付成功
async function processPaymentSuccess(orderId, tradeNo, amount) {
  const connection = await req.db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 更新訂單狀態
    await connection.execute(
      'UPDATE orders SET status = 3, trade_no = ?, updated_at = NOW() WHERE id = ?',
      [tradeNo, orderId]
    );
    
    // 獲取訂單信息
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      throw new Error('訂單不存在');
    }
    
    const order = orders[0];
    
    // 分配卡密
    const [availableCards] = await connection.execute(
      'SELECT * FROM cards WHERE product_id = ? AND status = 1 LIMIT ?',
      [order.product_id, order.buy_amount]
    );
    
    if (availableCards.length < order.buy_amount) {
      throw new Error('可用卡密不足');
    }
    
    // 更新卡密狀態
    const cardIds = availableCards.map(card => card.id);
    await connection.execute(
      `UPDATE cards SET status = 2, order_id = ?, updated_at = NOW() WHERE id IN (${cardIds.map(() => '?').join(',')})`,
      [orderId, ...cardIds]
    );
    
    // 更新商品銷量
    await connection.execute(
      'UPDATE products SET sales_count = sales_count + ? WHERE id = ?',
      [order.buy_amount, order.product_id]
    );
    
    await connection.commit();
    
    // 發送通知郵件（如果需要）
    // await sendOrderNotification(order, availableCards);
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 支付寶回調處理
async function handleAlipayCallback(data) {
  // 實現支付寶回調驗證邏輯
  // 這裡需要根據實際的支付寶配置來實現
  return {
    success: true,
    order_id: data.out_trade_no,
    trade_no: data.trade_no,
    amount: data.total_amount
  };
}

// 微信回調處理
async function handleWechatCallback(data) {
  // 實現微信回調驗證邏輯
  return {
    success: true,
    order_id: data.out_trade_no,
    trade_no: data.transaction_id,
    amount: data.total_fee / 100
  };
}

// PayJS回調處理
async function handlePayjsCallback(data) {
  // 驗證PayJS簽名
  const sign = generatePayjsSign(data);
  if (sign !== data.sign) {
    return { success: false };
  }
  
  return {
    success: true,
    order_id: data.out_trade_no,
    trade_no: data.payjs_order_id,
    amount: data.total_fee / 100
  };
}

// 碼支付回調處理
async function handleCodepayCallback(data) {
  // 驗證碼支付簽名
  const sign = generateCodepaySign(data);
  if (sign !== data.sign) {
    return { success: false };
  }
  
  return {
    success: true,
    order_id: data.pay_id,
    trade_no: data.trade_no,
    amount: data.price
  };
}

// 生成支付ID
function generatePaymentId() {
  return 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// 生成PayJS簽名
function generatePayjsSign(params) {
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'sign' && params[key])
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return crypto.createHash('md5')
    .update(sortedParams + '&key=' + process.env.PAYJS_KEY)
    .digest('hex')
    .toUpperCase();
}

// 生成碼支付簽名
function generateCodepaySign(params) {
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'sign' && params[key])
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return crypto.createHash('md5')
    .update(sortedParams + process.env.CODEPAY_KEY)
    .digest('hex');
}

module.exports = router; 