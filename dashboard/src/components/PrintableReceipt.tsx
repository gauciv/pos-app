import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface PrintableReceiptProps {
  order: Order;
}

export function PrintableReceipt({ order }: PrintableReceiptProps) {
  const { profile } = useCompanyProfile();

  return (
    <div id="printable-receipt" style={{ fontFamily: 'monospace', padding: '20px', maxWidth: '350px', margin: '0 auto', color: '#000' }}>
      {/* Header - Company Info */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {profile?.company_name || 'Company Name'}
        </h2>
        {order.stores?.name && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 'bold' }}>
            {order.stores.name}
          </p>
        )}
        {profile?.address && (
          <p style={{ margin: '2px 0 0', fontSize: '11px' }}>{profile.address}</p>
        )}
        {profile?.contact_phone && (
          <p style={{ margin: '2px 0 0', fontSize: '11px' }}>Tel: {profile.contact_phone}</p>
        )}
        {profile?.contact_email && (
          <p style={{ margin: '2px 0 0', fontSize: '11px' }}>{profile.contact_email}</p>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Transaction Metadata */}
      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span><strong>Order:</strong></span>
          <span>{order.order_number}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span><strong>Date:</strong></span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        {order.profiles?.full_name && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span><strong>Collector:</strong></span>
            <span>{order.profiles.full_name}</span>
          </div>
        )}
        {order.stores?.name && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span><strong>Client:</strong></span>
            <span>{order.stores.name}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Itemized List */}
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', paddingBottom: '4px', fontSize: '11px' }}>Product</th>
            <th style={{ textAlign: 'center', paddingBottom: '4px', fontSize: '11px' }}>Qty</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px', fontSize: '11px' }}>Price</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px', fontSize: '11px' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items?.map((item) => (
            <tr key={item.id}>
              <td style={{ paddingTop: '3px', paddingBottom: '3px', fontSize: '11px' }}>{item.product_name}</td>
              <td style={{ textAlign: 'center', paddingTop: '3px', paddingBottom: '3px', fontSize: '11px' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', paddingTop: '3px', paddingBottom: '3px', fontSize: '11px' }}>{formatCurrency(item.unit_price)}</td>
              <td style={{ textAlign: 'right', paddingTop: '3px', paddingBottom: '3px', fontSize: '11px' }}>{formatCurrency(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Financial Summary */}
      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>GRAND TOTAL</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {order.notes && (
        <>
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
          <div style={{ fontSize: '11px' }}>
            <p style={{ margin: 0 }}><strong>Notes:</strong> {order.notes}</p>
          </div>
        </>
      )}

      <div style={{ borderTop: '1px dashed #000', margin: '12px 0 8px' }} />

      {/* Signature Lines */}
      <div style={{ fontSize: '11px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', minHeight: '24px' }} />
            <span>Received By</span>
          </div>
          <div style={{ width: '40px' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', minHeight: '24px' }} />
            <span>Prepared By</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#444', marginTop: '8px' }}>
        {profile?.receipt_footer ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{profile.receipt_footer}</p>
        ) : (
          <p style={{ margin: 0 }}>Thank you for your order!</p>
        )}
      </div>
    </div>
  );
}
