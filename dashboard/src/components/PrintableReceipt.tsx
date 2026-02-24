import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface PrintableReceiptProps {
  order: Order;
}

export function PrintableReceipt({ order }: PrintableReceiptProps) {
  return (
    <div id="printable-receipt" style={{ fontFamily: 'monospace', padding: '20px', maxWidth: '300px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>ORDER RECEIPT</h2>
        <p style={{ margin: '4px 0', fontSize: '12px' }}>{order.order_number}</p>
        <p style={{ margin: '4px 0', fontSize: '12px' }}>{formatDate(order.created_at)}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', padding: '8px 0', fontSize: '12px' }}>
        <p><strong>Collector:</strong> {order.profiles?.full_name}</p>
        <p><strong>Store:</strong> {order.stores?.name}</p>
        {order.stores?.address && <p><strong>Address:</strong> {order.stores.address}</p>}
      </div>

      <div style={{ borderTop: '1px dashed #000', padding: '8px 0' }}>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item) => (
              <tr key={item.id}>
                <td style={{ paddingTop: '2px' }}>{item.product_name}</td>
                <td style={{ textAlign: 'right', paddingTop: '2px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', paddingTop: '2px' }}>{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px dashed #000', padding: '8px 0', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>TOTAL</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {order.notes && (
        <div style={{ borderTop: '1px dashed #000', padding: '8px 0', fontSize: '11px' }}>
          <p><strong>Notes:</strong> {order.notes}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#666' }}>
        <p>Thank you for your order</p>
      </div>
    </div>
  );
}
