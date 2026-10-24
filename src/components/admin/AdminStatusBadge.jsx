const STATUS_CONFIG = {
  // Order statuses
  pending:    { label: 'Pending',    bg: '#FEF3C7', color: '#92400E' },
  processing: { label: 'Processing', bg: '#DBEAFE', color: '#1E40AF' },
  shipped:    { label: 'Shipped',    bg: '#E0E7FF', color: '#3730A3' },
  delivered:  { label: 'Delivered',  bg: '#D1FAE5', color: '#065F46' },
  cancelled:  { label: 'Cancelled',  bg: '#FEE2E2', color: '#991B1B' },
  refunded:   { label: 'Refunded',   bg: '#F3F4F6', color: '#374151' },
  // Payment statuses
  paid:       { label: 'Paid',       bg: '#D1FAE5', color: '#065F46' },
  unpaid:     { label: 'Unpaid',     bg: '#FEF3C7', color: '#92400E' },
  // Stock statuses
  in_stock:   { label: 'In Stock',   bg: '#D1FAE5', color: '#065F46' },
  low_stock:  { label: 'Low Stock',  bg: '#FEF3C7', color: '#92400E' },
  out_stock:  { label: 'Out of Stock', bg: '#FEE2E2', color: '#991B1B' },
  // Active statuses
  active:     { label: 'Active',     bg: '#D1FAE5', color: '#065F46' },
  inactive:   { label: 'Inactive',   bg: '#F3F4F6', color: '#6B7280' },
}

export default function AdminStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#F3F4F6', color: '#374151' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
