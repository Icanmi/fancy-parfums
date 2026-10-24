// Button.jsx — Primary and Secondary variants
export default function Button({
  variant = 'primary',
  children,
  onClick,
  type = 'button',
  className = '',
  as: Tag = 'button',
  href,
}) {
  const cls = variant === 'secondary' ? 'btn-secondary' : 'btn-primary'

  if (href) {
    return (
      <a href={href} className={`${cls} ${className}`} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <Tag type={type} className={`${cls} ${className}`} onClick={onClick}>
      {children}
    </Tag>
  )
}
