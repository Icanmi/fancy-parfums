import { motion } from 'framer-motion'

export default function AdminStatCard({ icon: Icon, label, value, sub, color = '#D4AF37', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-sm p-5 flex items-start gap-4"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ede9e0' }}
    >
      <div
        className="w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#0A0A0A] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
          {value}
        </p>
        {sub && <p className="text-xs text-[#6B6B88] mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}
