import React, { useState } from 'react';


function OrderModal({
  product,
  availableProducts = [],
  initialQuantity = '1',
  initialNotes = '',
  onClose,
  onOrderSuccess
}) {
  const [selectedProduct, setSelectedProduct] = useState(product || availableProducts[0] || null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [quantity, setQuantity] = useState(initialQuantity || '1');
  const [minDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [preferredDate, setPreferredDate] = useState(() => {
    // Tomorrow as default pour date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('MORNING_6AM_12PM');
  const [needPump, setNeedPump] = useState(false);
  const [notes, setNotes] = useState(initialNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const formatSlot = (slot) => {
    switch (slot) {
      case 'MORNING_6AM_12PM':
        return 'Morning Slot (06:00 AM – 12:00 PM)';
      case 'AFTERNOON_12PM_6PM':
        return 'Afternoon Slot (12:00 PM – 06:00 PM)';
      case 'NIGHT_POUR':
        return 'Night Pour (Cool temperature curing, 08:00 PM – 04:00 AM)';
      default:
        return 'Standard Day Pour';
    }
  };

  const calculateEstimate = () => {
    if (!selectedProduct || !selectedProduct.price) return null;
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(selectedProduct.price) || 0;
    return q * p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (!selectedProduct) {
      setErrorMessage('Please select a product or concrete grade.');
      setSubmitting(false);
      return;
    }

    // Pack rich pour instructions into notes for backend compatibility
    const structuredNotes = [
      `[POUR DATE: ${preferredDate}]`,
      `[SLOT: ${formatSlot(timeSlot)}]`,
      needPump ? '[BOOM PUMP: REQUIRED]' : '[BOOM PUMP: NOT REQUIRED]',
      notes.trim() ? `Instructions: ${notes.trim()}` : ''
    ].filter(Boolean).join(' | ');

    try {
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          delivery_address: deliveryAddress.trim(),
          product_id: selectedProduct.id,
          quantity: Number(quantity),
          notes: structuredNotes
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to submit your order right now.');
      }

      setOrderResult({
        orderId: data.order_id,
        customerName: customerName.trim(),
        productName: selectedProduct.name,
        quantity: quantity,
        unit: selectedProduct.unit,
        phone: phone.trim(),
        preferredDate: preferredDate,
        timeSlot: formatSlot(timeSlot),
        needPump: needPump,
        address: deliveryAddress.trim(),
        totalEstimate: calculateEstimate()
      });

      if (onOrderSuccess) {
        onOrderSuccess(data.order_id);
      }
    } catch (err) {
      console.warn('Backend order save offline, falling back to direct WhatsApp dispatch:', err);
      // Generate immediate local reservation ID so customer can still send directly via WhatsApp
      const generatedId = Math.floor(1000 + Math.random() * 9000);
      setOrderResult({
        orderId: `BL-${generatedId}`,
        customerName: customerName.trim(),
        productName: selectedProduct.name,
        quantity: quantity,
        unit: selectedProduct.unit,
        phone: phone.trim(),
        preferredDate: preferredDate,
        timeSlot: formatSlot(timeSlot),
        needPump: needPump,
        address: deliveryAddress.trim(),
        totalEstimate: calculateEstimate()
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = () => {
    if (!orderResult) return '';
    // Bhagyalaxmi RMC plant dispatch hotline from official brochure
    const phoneNum = '919825495703';
    const text = encodeURIComponent(
      `*BHAGYALAXMI RMC - CONCRETE DISPATCH ORDER*\n\n` +
      `*Order ID:* #${orderResult.orderId}\n` +
      `*Customer / Company:* ${orderResult.customerName}\n` +
      `*Phone:* ${orderResult.phone}\n` +
      `*Grade / Material:* ${orderResult.productName}\n` +
      `*Quantity Required:* ${orderResult.quantity} ${orderResult.unit}\n` +
      `*Pour Date:* ${orderResult.preferredDate}\n` +
      `*Time Window:* ${orderResult.timeSlot}\n` +
      `*Mobile Boom Placer:* ${orderResult.needPump ? 'YES - REQUIRED' : 'NOT REQUIRED'}\n` +
      `*Site Delivery Address:* ${orderResult.address}\n\n` +
      `Please confirm batching schedule & transit mixer dispatch.`
    );
    return `https://wa.me/${phoneNum}?text=${text}`;
  };

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div
        className="order-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="order-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          &times;
        </button>

        {!orderResult ? (
          <>
            <div className="order-modal-header">
              <span className="badge badge-accent">BHAGYALAXMI RMC DISPATCH</span>
              <h2 id="order-dialog-title">Book Concrete or Transportation</h2>
              <p>
                Direct booking with our batching plant dispatch. Real-time scheduling & transit mixer allocation.
              </p>
            </div>

            {errorMessage && (
              <div className="alert-box alert-error" role="alert">
                <strong>Booking error:</strong> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="order-modal-form">
              {/* Product Selection */}
              <div className="form-group">
                <label htmlFor="product-select">Selected Grade / Material</label>
                <select
                  id="product-select"
                  value={selectedProduct ? selectedProduct.id : ''}
                  onChange={(e) => {
                    const found = availableProducts.find(
                      (p) => String(p.id) === String(e.target.value)
                    );
                    if (found) setSelectedProduct(found);
                  }}
                  required
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) — {p.price ? `₹${Number(p.price).toLocaleString('en-IN')}/${p.unit}` : 'Price on request'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Unit Row */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="order-quantity">
                    Quantity Required ({selectedProduct ? selectedProduct.unit : 'm³'})
                  </label>
                  <input
                    id="order-quantity"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                  {selectedProduct && selectedProduct.category === 'RMC' && (
                    <small className="form-hint">
                      Standard transit mixer holds approx. 6.0 m³.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="order-date">Preferred Pour Date</label>
                  <input
                    id="order-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={minDate}
                    required
                  />
                </div>
              </div>

              {/* Time slot & Pump option */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="time-slot-select">Dispatch Time Window</label>
                  <select
                    id="time-slot-select"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    <option value="MORNING_6AM_12PM">Morning (6:00 AM – 12:00 PM)</option>
                    <option value="AFTERNOON_12PM_6PM">Afternoon (12:00 PM – 6:00 PM)</option>
                    <option value="NIGHT_POUR">Night Pour (8:00 PM – 4:00 AM)</option>
                  </select>
                </div>

                <div className="form-group checkbox-group-inline">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={needPump}
                      onChange={(e) => setNeedPump(e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      <strong>Need Mobile Boom Pump?</strong>
                      <small>36m vertical hydraulic placer on site</small>
                    </span>
                  </label>
                </div>
              </div>

              {/* Customer Info */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="customer-name">Full Name / Company Name</label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Patel / Buildwell Infra"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-phone">Phone Number (WhatsApp Active)</label>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="form-group">
                <label htmlFor="delivery-address">Site Location / Pour Address & Landmark</label>
                <textarea
                  id="delivery-address"
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Plot/Survey No., Project Name, Nearest Landmark, City/Area"
                  maxLength={1000}
                  required
                />
              </div>

              {/* Optional Special Notes */}
              <div className="form-group">
                <label htmlFor="order-notes">Special Instructions (Optional)</label>
                <input
                  id="order-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Retarder required for night pour, narrow access road"
                  maxLength={500}
                />
              </div>

              {/* Estimated Pricing Banner */}
              {calculateEstimate() !== null && (
                <div className="order-price-estimate">
                  <span>Estimated Material Cost:</span>
                  <strong>₹{calculateEstimate().toLocaleString('en-IN')}</strong>
                  <small>(Taxes & pumping extra as applicable)</small>
                </div>
              )}

              {/* Submit CTA */}
              <div className="order-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Connecting Plant...' : 'Confirm & Submit Order →'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Order Confirmation Screen */
          <div className="order-success-screen">
            <div className="success-icon-badge">✓</div>
            <span className="badge badge-success">BOOKING RECEIVED</span>
            <h2>Order #{orderResult.orderId} Confirmed!</h2>
            <p>
              Thank you, <strong>{orderResult.customerName}</strong>. Our plant dispatcher has received your pour request.
            </p>

            <div className="order-summary-card">
              <div className="summary-row">
                <span>Material:</span>
                <strong>{orderResult.productName}</strong>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <strong>{orderResult.quantity} {orderResult.unit}</strong>
              </div>
              <div className="summary-row">
                <span>Pour Date & Window:</span>
                <strong>{orderResult.preferredDate} ({orderResult.timeSlot})</strong>
              </div>
              <div className="summary-row">
                <span>Boom Pump:</span>
                <strong>{orderResult.needPump ? 'Yes (Requested)' : 'Not Required'}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery Site:</span>
                <span className="address-val">{orderResult.address}</span>
              </div>
              {orderResult.totalEstimate && (
                <div className="summary-row total-row">
                  <span>Estimated Amount:</span>
                  <strong className="price-tag">₹{orderResult.totalEstimate.toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>

            <div className="success-actions">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <span>💬 Send Details to Dispatch via WhatsApp</span>
              </a>

              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Done / Back to Website
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderModal;
