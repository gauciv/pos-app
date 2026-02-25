import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface PrintableReceiptProps {
  order: Order;
}

const separator = '- - - - - - - - - - - - - - - - - - - - -';

export function PrintableReceipt({ order }: PrintableReceiptProps) {
  const { profile } = useCompanyProfile();

  return (
    <div
      id="printable-receipt"
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        padding: '16px 20px',
        maxWidth: '380px',
        margin: '0 auto',
        color: '#000',
        fontSize: '12px',
        lineHeight: 1.5,
      }}
    >
      {/* Header - Company Info */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {profile?.company_name || 'Company Name'}
        </div>
        {order.stores?.name && (
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>
            {order.stores.name}
          </div>
        )}
        {profile?.address && (
          <div style={{ fontSize: '11px', marginTop: '2px' }}>{profile.address}</div>
        )}
        {profile?.contact_phone && (
          <div style={{ fontSize: '11px' }}>Tel: {profile.contact_phone}</div>
        )}
        {profile?.contact_email && (
          <div style={{ fontSize: '11px' }}>{profile.contact_email}</div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>{separator}</div>

      {/* Transaction Metadata */}
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', margin: '6px 0' }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 'bold', paddingRight: '8px', whiteSpace: 'nowrap' }}>Order</td>
            <td style={{ textAlign: 'right' }}>{order.order_number}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold', paddingRight: '8px', whiteSpace: 'nowrap' }}>Date</td>
            <td style={{ textAlign: 'right' }}>{formatDate(order.created_at)}</td>
          </tr>
          {order.profiles?.full_name && (
            <tr>
              <td style={{ fontWeight: 'bold', paddingRight: '8px', whiteSpace: 'nowrap' }}>Collector</td>
              <td style={{ textAlign: 'right' }}>{order.profiles.full_name}</td>
            </tr>
          )}
          {order.stores?.name && (
            <tr>
              <td style={{ fontWeight: 'bold', paddingRight: '8px', whiteSpace: 'nowrap' }}>Client</td>
              <td style={{ textAlign: 'right' }}>{order.stores.name}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>{separator}</div>

      {/* Itemized List */}
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', margin: '6px 0' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', paddingBottom: '4px', fontWeight: 'bold', width: '40%' }}>Product</th>
            <th style={{ textAlign: 'center', paddingBottom: '4px', fontWeight: 'bold', width: '10%' }}>Qty</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px', fontWeight: 'bold', width: '25%' }}>Price</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px', fontWeight: 'bold', width: '25%' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items?.map((item) => (
            <tr key={item.id}>
              <td style={{ paddingTop: '4px', paddingBottom: '4px', verticalAlign: 'top' }}>
                {item.product_name}
              </td>
              <td style={{ textAlign: 'center', paddingTop: '4px', paddingBottom: '4px', verticalAlign: 'top' }}>
                {item.quantity}
              </td>
              <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px', verticalAlign: 'top' }}>
                {formatCurrency(item.unit_price)}
              </td>
              <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px', verticalAlign: 'top' }}>
                {formatCurrency(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>{separator}</div>

      {/* Grand Total */}
      <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', margin: '6px 0' }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 'bold' }}>GRAND TOTAL</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(order.total_amount)}</td>
          </tr>
        </tbody>
      </table>

      {order.notes && (
        <>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>{separator}</div>
          <div style={{ fontSize: '11px', margin: '6px 0' }}>
            <span style={{ fontWeight: 'bold' }}>Notes:</span> {order.notes}
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>{separator}</div>

      {/* Signature Lines */}
      <div style={{ marginTop: '28px', marginBottom: '12px' }}>
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '45%', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '4px' }}>
                <div style={{ borderBottom: '1px solid #000', minHeight: '28px' }} />
              </td>
              <td style={{ width: '10%' }} />
              <td style={{ width: '45%', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '4px' }}>
                <div style={{ borderBottom: '1px solid #000', minHeight: '28px' }} />
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', paddingTop: '2px' }}>Received By</td>
              <td />
              <td style={{ textAlign: 'center', paddingTop: '2px' }}>Prepared By</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#444', marginTop: '16px' }}>
        {profile?.receipt_footer ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{profile.receipt_footer}</div>
        ) : (
          <div>Thank you for your order!</div>
        )}
      </div>
    </div>
  );
}
