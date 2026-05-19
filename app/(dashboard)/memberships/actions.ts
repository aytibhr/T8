'use server';

import { db } from '@/lib/db/drizzle';
import { userMemberships, membershipPlans, transactions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createOrUpdateMember(data: { name: string, phone: string, planId: number }) {
  const [plan] = await db.select().from(membershipPlans).where(eq(membershipPlans.id, data.planId));
  if (!plan) throw new Error("Plan not found");

  const [existing] = await db.select().from(userMemberships).where(eq(userMemberships.phone, data.phone));

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 1);

  if (existing) {
    // Update existing member (Top-up)
    await db.update(userMemberships)
      .set({
        name: data.name, // Update name if changed
        planId: data.planId,
        coinsBalance: existing.coinsBalance + plan.creditsValue,
        validUntil: validUntil,
      })
      .where(eq(userMemberships.id, existing.id));

    // Record top-up transaction
    await db.insert(transactions).values({
      userPhone: data.phone,
      amountCash: plan.price,
      amountCreditsUsed: 0,
      transactionType: 'Membership',
      timestamp: new Date(),
      customerName: data.name,
    });
  } else {
    // Create new member
    await db.insert(userMemberships).values({
      name: data.name,
      phone: data.phone,
      planId: data.planId,
      coinsBalance: plan.creditsValue,
      validUntil: validUntil,
    });

    // Record initial purchase
    await db.insert(transactions).values({
      userPhone: data.phone,
      amountCash: plan.price,
      amountCreditsUsed: 0,
      transactionType: 'Membership',
      timestamp: new Date(),
      customerName: data.name,
    });
  }

  revalidatePath('/memberships');
  revalidatePath('/dashboard');
}

export async function updatePlan(data: { id: number, price: number, creditsValue: number, hoursIncluded: number }) {
  await db.update(membershipPlans)
    .set({
      price: data.price,
      creditsValue: data.creditsValue,
      hoursIncluded: data.hoursIncluded,
    })
    .where(eq(membershipPlans.id, data.id));
  
  revalidatePath('/memberships');
}

export async function getMemberTransactions(phone: string) {
  return await db.select()
    .from(transactions)
    .where(eq(transactions.userPhone, phone))
    .orderBy(desc(transactions.timestamp));
}
