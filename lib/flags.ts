// Accounts (sign-in, saved trips and looks) are off until Clerk's production domain is ready.
// Turn them back on by setting NEXT_PUBLIC_ACCOUNTS_ENABLED=true in Vercel and redeploying.
export const ACCOUNTS_ENABLED = process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === 'true'
