export default function FDLogo({ size = 52, className = '' }) {
  return (
    <img
      src="/fd-logo.png"
      alt="FEARLESS DAWN"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
