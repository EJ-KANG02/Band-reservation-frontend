/**
 * FEARLESS DAWN 이퀄라이저 바 로고
 */
export default function FDLogo({ size = 52, color = 'white', className = '' }) {
  const h = Math.round(size * (44 / 52))
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 52 44"
      fill="none"
      className={className}
    >
      <rect x="0"  y="16" width="12" height="28" rx="3" fill={color} />
      <rect x="20" y="0"  width="12" height="44" rx="3" fill={color} />
      <rect x="40" y="8"  width="12" height="36" rx="3" fill={color} />
    </svg>
  )
}
