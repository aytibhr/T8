import { getUser } from '@/lib/db/queries';
import { AccountClient } from './account-client';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  return <AccountClient user={user} />;
}
