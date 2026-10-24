// Badge.jsx — New Arrival (lemon) and Best Seller (gold/charcoal) badges
export default function Badge({ type = 'new' }) {
  if (type === 'bestseller') {
    return <span className="badge-bestseller">Best Seller</span>
  }
  return <span className="badge-new">New Arrival</span>
}
