import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';

// Pricing page is not needed. Redirect to dashboard.
export default async function PricingPage() {
  const user = await getUser();
  if (user) redirect('/dashboard');
  else redirect('/sign-in');
}
