import { Link } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-gray-500 py-3 overflow-x-auto">
      <Link to="/" className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors">
        <FiHome size={13} />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={item.label || index} className="flex items-center gap-2 flex-shrink-0">
            <FiChevronRight size={12} className="text-gray-400" />
            {isLast || !item.to ? (
              <span className="font-semibold text-[#0A0A0A] truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="hover:text-[#D4AF37] transition-colors truncate">
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
