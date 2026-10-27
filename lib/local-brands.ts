// Labels from parché's home city get a credit line wherever their pieces appear.
export const LOCAL_BRANDS: Record<string, string> = {
  Shan: 'Montréal label, made in Canada',
}
export const localCredit = (brand: string): string | undefined => LOCAL_BRANDS[brand]

// Partner labels parché features: they lead where they're strongest (Shan: swim and resort) and appear across the edit.
const FEATURED: Record<string, { strong: string[] }> = {
  Shan: { strong: ['swim', 'dress', 'linen-shirt', 'light-trousers', 'skirt', 'shorts', 'light-scarf', 'sun-hat', 'shirt', 'blazer'] },
}
export const featuredBoost = (brand: string, kind: string): number => {
  const f = FEATURED[brand]
  // Swimwear is what Shan is known for, so it leads there even against cheaper or more on-palette suits.
  return f ? (kind === 'swim' && f.strong.includes('swim') ? 4 : f.strong.includes(kind) ? 2.5 : 1) : 0
}
