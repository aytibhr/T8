import { db } from '@/lib/db/drizzle';
import { membershipPlans, userMemberships } from '@/lib/db/schema';
import { MembershipsClient } from './memberships-client';
import { eq } from 'drizzle-orm';

export default async function MembershipsPage() {
  const plans = await db.select().from(membershipPlans).orderBy(membershipPlans.id);
  
  // Fetch members and join with plans to get planName
  const membersData = await db.select({
    id: userMemberships.id,
    name: userMemberships.name,
    phone: userMemberships.phone,
    coinsBalance: userMemberships.coinsBalance,
    validUntil: userMemberships.validUntil,
    planName: membershipPlans.name
  })
  .from(userMemberships)
  .leftJoin(membershipPlans, eq(userMemberships.planId, membershipPlans.id))
  .orderBy(userMemberships.id);

  return <MembershipsClient initialPlans={plans} initialMembers={membersData} />;
}
