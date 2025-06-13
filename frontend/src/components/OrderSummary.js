import React from "react";

const OrderSummary = ({ cartItems, total }) => {
  return (
    <div className="order-summary" style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: 8, marginTop: 24, minWidth: 280 }}>
      <h3 style={{ marginBottom: 16, color: '#1a237e', fontWeight: 600 }}>Order Summary</h3>
      <div className="order-items">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.product_id || item.id} className="order-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="item-details">
                <span className="item-name" style={{ fontWeight: 500 }}>{item.name}</span>
                <span className="item-quantity" style={{ color: '#666', fontSize: 13 }}>Qty: {item.quantity}</span>
              </div>
              <span className="item-price" style={{ fontWeight: 500 }}>${parseFloat(item.price).toFixed(2)}</span>
            </div>
          ))
        ) : (
          <div style={{ color: '#888', fontStyle: 'italic' }}>No items in cart.</div>
        )}
      </div>
      <div className="order-total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, marginTop: 18, borderTop: '1px solid #ddd', paddingTop: 12 }}>
        <span>Total:</span>
        <span>${parseFloat(total || 0).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderSummary; 