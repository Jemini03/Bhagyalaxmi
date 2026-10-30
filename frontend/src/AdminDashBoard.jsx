import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'RMC',
    description: '',
    unit: 'm3',
    price: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productMessage, setProductMessage] = useState('');
  const [productSubmitting, setProductSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    async function initDashboard() {
      try {
        // First verify authentication
        const meRes = await fetch('http://localhost:5001/api/admin/me', {
          credentials: 'include'
        });

        if (meRes.status === 401) {
          navigate('/admin/login');
          return;
        }

        const meData = await meRes.json();
        if (meData.success && meData.admin) {
          setAdminUser(meData.admin);
        }

        await refreshData();
      } catch (err) {
        console.error('Dashboard init error:', err);
        setError('Unable to reach backend server. Please verify backend is running on port 5001.');
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [navigate]);

  const refreshData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/orders', { credentials: 'include' }),
        fetch('http://localhost:5001/api/admin/products', { credentials: 'include' })
      ]);

      if (ordersRes.status === 401 || productsRes.status === 401) {
        navigate('/admin/login');
        return;
      }

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
      if (productsData.success) {
        setProducts(productsData.products || []);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
      setError(err.message || 'Error updating dashboard records.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Logout network error:', e);
    } finally {
      navigate('/admin/login');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setSavingOrderId(orderId);
    setError('');

    try {
      const response = await fetch(`http://localhost:5001/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Status update failed.');
      }

      // Optimistically update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      setSelectedStatuses((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setSavingOrderId(null);
    }
  };

  const toggleProductAvailability = async (product) => {
    const nextVal = !Boolean(product.is_available);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/products/${product.id}/availability`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: nextVal })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_available: nextVal ? 1 : 0 } : p))
        );
        setProductMessage(`"${product.name}" is now ${nextVal ? 'Available' : 'Unavailable'}.`);
      }
    } catch (err) {
      setProductMessage('Could not toggle availability: ' + err.message);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductSubmitting(true);
    setProductMessage('');

    try {
      const isEditing = editingProductId !== null;
      const url = isEditing
        ? `http://localhost:5001/api/admin/products/${editingProductId}`
        : 'http://localhost:5001/api/admin/products';

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: productForm.price === '' ? null : Number(productForm.price)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Product save failed.');
      }

      setProductMessage(isEditing ? 'Product updated successfully!' : 'Product added successfully!');
      setProductForm({
        name: '',
        category: 'RMC',
        description: '',
        unit: 'm3',
        price: ''
      });
      setEditingProductId(null);
      await refreshData();
    } catch (err) {
      setProductMessage(err.message || 'Failed to save product.');
    } finally {
      setProductSubmitting(false);
    }
  };

  // Helper to generate WhatsApp update link for customers
  const getCustomerWhatsAppLink = (order) => {
    const cleanPhone = String(order.phone || '').replace(/\D/g, '');
    let msg = '';
    switch (order.status) {
      case 'CONFIRMED':
        msg = `Hello ${order.customer_name}, your order #${order.id} for ${order.quantity} ${order.product_unit} of ${order.product_name} is CONFIRMED by Bhagyalaxmi RMC. Batching is scheduled.`;
        break;
      case 'IN_PROGRESS':
        msg = `Hello ${order.customer_name}, your transit mixer for order #${order.id} (${order.product_name}) has been DISPATCHED from the batching plant and is en route to ${order.delivery_address}.`;
        break;
      case 'DELIVERED':
        msg = `Hello ${order.customer_name}, order #${order.id} (${order.product_name}) has been successfully poured and DELIVERED. Thank you for choosing Bhagyalaxmi RMC!`;
        break;
      default:
        msg = `Hello ${order.customer_name}, regarding your order #${order.id} with Bhagyalaxmi RMC. Current status: ${order.status}.`;
        break;
    }
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(order.id).includes(q) ||
      String(order.customer_name || '').toLowerCase().includes(q) ||
      String(order.phone || '').includes(q) ||
      String(order.delivery_address || '').toLowerCase().includes(q) ||
      String(order.product_name || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    confirmed: orders.filter((o) => o.status === 'CONFIRMED').length,
    inProgress: orders.filter((o) => o.status === 'IN_PROGRESS').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    products: products.length
  };

  return (
    <div className="admin-portal-wrapper">
      {/* Top Operations Bar */}
      <header className="admin-topbar">
        <div className="admin-brand-cluster">
          <div className="brand-logo-mark small">
            <span className="logo-letter">B</span>
          </div>
          <div>
            <div className="admin-brand-title">BHAGYALAXMI RMC • PLANT OPERATIONS</div>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <button
            type="button"
            className="btn-admin-subtle"
            onClick={() => navigate('/')}
          >
            ← View Public Website
          </button>
          <button
            type="button"
            className="btn-admin-logout"
            onClick={handleLogout}
          >
            Sign Out 🚪
          </button>
        </div>
      </header>

      <div className="admin-layout-container">
       
{/* Dashboard Summary */}
<section className="admin-kpi-grid">
  <div className="kpi-card">
    <span className="kpi-sub">Total Orders</span>
    <strong className="kpi-val">{stats.total}</strong>
  </div>

  <div className="kpi-card kpi-pending">
    <span className="kpi-sub">Pending Orders</span>
    <strong className="kpi-val text-amber">{stats.pending}</strong>
  </div>

  <div className="kpi-card">
    <span className="kpi-sub">Products</span>
    <strong className="kpi-val">{stats.products}</strong>
  </div>
</section>

        {/* Navigation Tabs */}
        <div className="admin-tab-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Customer Orders ({orders.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            ⚙️ Product & Mix Catalogue ({products.length})
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error" role="alert">
            {error}
          </div>
        )}

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <section className="admin-orders-pane">
            {/* Filter Toolbar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  placeholder="Search by customer name, phone, address, or order ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="admin-status-pills">
                {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`status-pill-btn ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="admin-loading">Loading order queue from MySQL database...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="admin-empty-state">
                <p>No orders match the current filter or search criteria.</p>
              </div>
            ) : (
              <div className="admin-orders-grid">
                {filteredOrders.map((ord) => {
                  const currentStatus = selectedStatuses[ord.id] ?? ord.status;
                  const isDirty = (selectedStatuses[ord.id] !== undefined) && (selectedStatuses[ord.id] !== ord.status);

                  return (
                    <article className={`admin-order-card status-${ord.status.toLowerCase()}`} key={ord.id}>
                      <div className="order-card-head">
                        <div>
                          <span className="order-id-badge">ORDER #{ord.id}</span>
                          <span className="order-date-text">
                            {new Date(ord.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <span className={`status-tag status-${ord.status.toLowerCase()}`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="order-customer-section">
                        <h4>{ord.customer_name}</h4>
                        <div className="customer-contact-row">
                          <a href={`tel:${ord.phone}`} className="phone-link">
                            📞 {ord.phone}
                          </a>
                          <a
                            href={getCustomerWhatsAppLink(ord)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-notify-whatsapp"
                            title="Send status message to customer via WhatsApp"
                          >
                            💬 Notify Customer
                          </a>
                        </div>
                      </div>

                      <div className="order-specs-box">
                        <div className="spec-row">
                          <span className="spec-label">Material / Grade:</span>
                          <strong className="spec-value">{ord.product_name}</strong>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Quantity:</span>
                          <strong className="spec-value">{ord.quantity} {ord.product_unit}</strong>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Site Address:</span>
                          <span className="address-snippet">{ord.delivery_address}</span>
                        </div>
                        {ord.notes && (
                          <div className="spec-notes">
                            <span className="notes-label">Pour Instructions:</span>
                            <p>{ord.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="order-action-footer">
                        <label className="status-select-label" htmlFor={`status-sel-${ord.id}`}>
                          Update Status:
                        </label>
                        <div className="status-update-row">
                          <select
                            id={`status-sel-${ord.id}`}
                            value={currentStatus}
                            onChange={(e) =>
                              setSelectedStatuses({
                                ...selectedStatuses,
                                [ord.id]: e.target.value
                              })
                            }
                          >
                            <option value="PENDING">PENDING (Reviewing)</option>
                            <option value="CONFIRMED">CONFIRMED (Scheduled)</option>
                            <option value="IN_PROGRESS">IN PROGRESS (Dispatched)</option>
                            <option value="DELIVERED">DELIVERED (Poured)</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>

                          <button
                            type="button"
                            className={`btn-save-status ${isDirty ? 'dirty' : ''}`}
                            disabled={savingOrderId === ord.id || !isDirty}
                            onClick={() => updateOrderStatus(ord.id, currentStatus)}
                          >
                            {savingOrderId === ord.id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Product & Mix Catalogue Management */}
        {activeTab === 'products' && (
          <section className="admin-products-pane">
            {/* Add / Edit Product Form */}
            <div className="admin-product-form-card">
              <div className="form-card-header">
                <h3>{editingProductId !== null ? '✏️ Edit Catalogue Product' : '➕ Add New Mix Grade or Transport Offering'}</h3>
                <p>Configure grade specifications, measurement unit, and pricing.</p>
              </div>

              {/* Grade Quick Preset Pills */}
              
              {productMessage && (
                <div className="alert-box alert-info">{productMessage}</div>
              )}

              <form onSubmit={handleProductSubmit} className="admin-product-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Product / Grade Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. M25 Grade Structural Concrete"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setProductForm({
                          ...productForm,
                          category: cat,
                          unit: cat === 'RMC' ? 'm3' : 'trip'
                        });
                      }}
                    >
                      <option value="RMC">Ready-Mix Concrete (RMC)</option>
                      <option value="TRANSPORT">Material Transportation & Logistics</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description & Technical Application</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="e.g. Suitable for multi-storey RCC frame, raft foundation, columns and beams."
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Billing Unit (e.g. m3, trip, pour, ton)</label>
                    <input
                      type="text"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Base Price in ₹ (Leave blank for 'Price on Request')</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. 4550"
                    />
                  </div>
                </div>

                <div className="form-btn-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={productSubmitting}
                  >
                    {productSubmitting ? 'Saving...' : editingProductId !== null ? 'Save Changes' : 'Add to Catalogue'}
                  </button>

                  {editingProductId !== null && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm({
                          name: '',
                          category: 'RMC',
                          description: '',
                          unit: 'm3',
                          price: ''
                        });
                        setProductMessage('');
                      }}
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Existing Products List */}
            <div className="admin-product-list-card">
              <h3>Currently Listed Offerings ({products.length})</h3>

              <div className="admin-products-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Product / Grade</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Base Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <button
                            type="button"
                            className={`toggle-avail-btn ${p.is_available ? 'is-active' : 'is-inactive'}`}
                            onClick={() => toggleProductAvailability(p)}
                            title="Click to toggle availability"
                          >
                            {p.is_available ? '● Available' : '○ Inactive'}
                          </button>
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          {p.description && <p className="prod-subtext">{p.description}</p>}
                        </td>
                        <td>
                          <span className={`cat-pill ${p.category === 'RMC' ? 'pill-rmc' : 'pill-transport'}`}>
                            {p.category}
                          </span>
                        </td>
                        <td>{p.unit}</td>
                        <td>
                          {p.price != null ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'On Request'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-edit-product"
                            onClick={() => {
                              setEditingProductId(p.id);
                              setProductForm({
                                name: p.name,
                                category: p.category,
                                description: p.description || '',
                                unit: p.unit,
                                price: p.price == null ? '' : String(p.price)
                              });
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
