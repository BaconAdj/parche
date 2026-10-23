// Two-row scrolling brand strip. Pure CSS: the list is rendered twice and slides by half its width,
// so there is no measuring loop to go wrong. Pauses on hover and stops for reduced-motion users.
export function BrandMarquee({ brands, reverse = false, ghost = false, label }: { brands: string[]; reverse?: boolean; ghost?: boolean; label: string }) {
  if (!brands.length) return null
  const seconds = Math.max(30, brands.length * 2.2)
  return (
    <div className={`marquee${reverse ? ' marquee--rev' : ''}`} role="region" aria-label={label}>
      <div className="marquee-track" style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map(copy => (
          <ul key={copy} className="marquee-list" aria-hidden={copy === 1 || undefined}>
            {brands.map(b => <li key={b} className={`brand-loop-item${ghost ? ' brand-loop-item--ghost' : ''}`}>{b}</li>)}
          </ul>
        ))}
      </div>
    </div>
  )
}
