export function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-1.5">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <rect width="30" height="30" rx="8" fill="#fff" />
        <rect x="7" y="8" width="11" height="3" rx="1.5" fill="#2c2ee8" />
        <rect x="7" y="13.5" width="8" height="3" rx="1.5" fill="#2c2ee8" />
        <rect x="7" y="19" width="5" height="3" rx="1.5" fill="#2c2ee8" />
        <circle cx="21.5" cy="20.5" r="3.5" fill="#ff6a1a" />
      </svg>
      <span className="font-brand text-[22px] font-extrabold tracking-[-0.02em]">Insumo</span>
    </div>
  )
}
