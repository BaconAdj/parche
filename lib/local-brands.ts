// Labels from parché's home city get a credit line wherever their pieces appear.
export const LOCAL_BRANDS: Record<string, string> = {
  Shan: 'Montréal label, made in Canada',
}
export const localCredit = (brand: string): string | undefined => LOCAL_BRANDS[brand]
