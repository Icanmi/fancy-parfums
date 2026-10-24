// StarRating.jsx — 1–5 filled stars with review count
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export default function StarRating({ rating = 0, count }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const full = i + 1
    if (rating >= full) return 'full'
    if (rating >= full - 0.5) return 'half'
    return 'empty'
  })

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((type, i) => (
          <span key={i} style={{ color: '#D4AF37', fontSize: '0.75rem' }}>
            {type === 'full' ? (
              <FaStar />
            ) : type === 'half' ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </span>
        ))}
      </div>
      {count != null && (
        <span
          className="text-xs"
          style={{ color: '#6B6B88', marginLeft: '2px' }}
        >
          ({count})
        </span>
      )}
    </div>
  )
}
