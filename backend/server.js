const db = require('./db');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

app.use(express.json());

app.use(session({
  name: 'rmc_admin_session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, 
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000 
  }
}));

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  next();
}


// Test route
app.get('/', (req, res) => {
  res.send('Bhagyalaxmi RMC backend is running!');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Bhagyalaxmi RMC Plant Server',
    timestamp: new Date().toISOString()
  });
});
// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const [admins] = await db.query(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      [username.trim()]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const admin = admins[0];
    const passwordMatches = await require('bcrypt').compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Regenerate the session after successful authentication
    req.session.regenerate((error) => {
      if (error) {
        console.error('Session regeneration failed:', error.message);

        return res.status(500).json({
          success: false,
          message: 'Unable to start your session.'
        });
      }

      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;

      req.session.save((saveError) => {
        if (saveError) {
          console.error('Session save failed:', saveError.message);

          return res.status(500).json({
            success: false,
            message: 'Unable to save your session.'
          });
        }

        return res.json({
          success: true,
          message: 'Login successful.',
          admin: {
            id: admin.id,
            username: admin.username
          }
        });
      });
    });
  } catch (error) {
    console.error('Admin login failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to log in right now.'
    });
  }
});
// Check whether an admin is logged in
app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.session.adminId,
      username: req.session.adminUsername
    }
  });
});
// Admin logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Admin logout failed:', error.message);

      return res.status(500).json({
        success: false,
        message: 'Unable to log out.'
      });
    }

    res.clearCookie('rmc_admin_session', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
});
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products WHERE is_available = TRUE'
    );

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);

    res.status(500).json({
      success: false,
      message: 'Could not fetch products'
    });
  }
});

// Get all products for product management
app.get('/api/admin/products',requireAdmin, async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching admin products:', error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve products.'
    });
  }
});

// Create a new customer order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      delivery_address,
      product_id,
      quantity,
      notes
    } = req.body;

    // Validate required fields
    if (
      !customer_name?.trim() ||
      !phone?.trim() ||
      !delivery_address?.trim() ||
      !product_id ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid customer details, product and quantity.'
      });
    }

    // Check that the selected product exists and is available
    const [products] = await db.query(
      'SELECT id FROM products WHERE id = ? AND is_available = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected product is unavailable.'
      });
    }

    // Save the order in MySQL
    const [result] = await db.query(
      `INSERT INTO orders
       (customer_name, phone, delivery_address, product_id, quantity, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customer_name.trim(),
        phone.trim(),
        delivery_address.trim(),
        Number(product_id),
        Number(quantity),
        notes?.trim() || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Order submitted successfully.',
      order_id: result.insertId
    });

  } catch (error) {
    console.error('Error creating order:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to submit your order right now.'
    });
  }
});
// Get all orders for the admin dashboard
app.get('/api/admin/orders',requireAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT
        o.id,
        o.customer_name,
        o.phone,
        o.delivery_address,
        o.quantity,
        o.notes,
        o.status,
        o.created_at,
        p.name AS product_name,
        p.category AS product_category,
        p.unit AS product_unit
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve orders.'
    });
  }
});

// Create a new product (admin)
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  console.log('Request body:', req.body);
    try {
    const {
      name,
      category,
      description,
      unit,
      price
    } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !['RMC', 'TRANSPORT'].includes(category) ||
      !unit?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name, category and unit.'
      });
    }

    // Validate price when supplied
    const parsedPrice =
      price === '' || price === null || price === undefined
        ? null
        : Number(price);

    if (
      parsedPrice !== null &&
      (!Number.isFinite(parsedPrice) ||
        parsedPrice < 0 ||
        !Number.isInteger(parsedPrice * 100))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative amount.'
      });
    }

    // Save the product in MySQL
    const [result] = await db.query(
      `INSERT INTO products
       (name, category, description, unit, price, is_available)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [
        name.trim(),
        category,
        description?.trim() || null,
        unit.trim(),
        parsedPrice
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product_id: result.insertId
    });

  } catch (error) {
    console.error('Error creating product:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to create the product right now.'
    });
  }
});

// Update an existing product (admin)
app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const {
      name,
      category,
      description,
      unit,
      price
    } = req.body;

    // Validate product ID
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    // Validate required fields
    if (
      !name?.trim() ||
      !['RMC', 'TRANSPORT'].includes(category) ||
      !unit?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name, category and unit.'
      });
    }

    // Validate price
    const parsedPrice =
      price === '' || price === null || price === undefined
        ? null
        : Number(price);

    if (
      parsedPrice !== null &&
      (!Number.isFinite(parsedPrice) ||
        parsedPrice < 0 ||
        !Number.isInteger(parsedPrice * 100))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative amount.'
      });
    }

    // Check that the product exists
    const [existingProducts] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Update the existing product
    await db.query(
      `UPDATE products
       SET name = ?, category = ?, description = ?, unit = ?, price = ?
       WHERE id = ?`,
      [
        name.trim(),
        category,
        description?.trim() || null,
        unit.trim(),
        parsedPrice,
        productId
      ]
    );

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product_id: productId
    });

  } catch (error) {
    console.error('Error updating product:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to update the product right now.'
    });
  }
});


// Update product availability
app.patch('/api/admin/products/:id/availability', requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { is_available } = req.body;

    // Validate product ID
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    // Validate availability value
    if (typeof is_available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_available must be true or false.'
      });
    }

    // Check whether the product exists
    const [products] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Update availability
    await db.query(
      'UPDATE products SET is_available = ? WHERE id = ?',
      [is_available, productId]
    );

    return res.json({
      success: true,
      message: is_available
        ? 'Product is now available.'
        : 'Product is now unavailable.',
      product_id: productId,
      is_available
    });

  } catch (error) {
    console.error('Error updating product availability:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to update product availability.'
    });
  }
});

// Update an order's status
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      'PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'DELIVERED',
      'CANCELLED'
    ];

    // Validate the order ID
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    // Validate the requested status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.'
      });
    }

    // Check whether the order exists
    const [orders] = await db.query(
      'SELECT id FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Update the status in MySQL
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      order_id: orderId,
      status
    });
  } catch (error) {
    console.error('Error updating order status:', error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to update order status.'
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});