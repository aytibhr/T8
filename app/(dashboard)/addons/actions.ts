'use server';

import { db } from '@/lib/db/drizzle';
import { addons, sessionAddons } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Fetch all available addons
export async function getAddons() {
  return await db.select().from(addons).orderBy(addons.name);
}

// Create a new addon
export async function createAddon(data: { name: string; price: number }) {
  await db.insert(addons).values({
    name: data.name,
    price: data.price,
  });
  revalidatePath('/addons');
  revalidatePath('/dashboard');
}

// Update an existing addon
export async function updateAddon(id: number, data: { name: string; price: number }) {
  await db.update(addons).set({
    name: data.name,
    price: data.price,
    updatedAt: new Date(),
  }).where(eq(addons.id, id));
  revalidatePath('/addons');
  revalidatePath('/dashboard');
}

// Delete an addon
export async function deleteAddon(id: number) {
  await db.delete(addons).where(eq(addons.id, id));
  revalidatePath('/addons');
  revalidatePath('/dashboard');
}

// Get all addons linked to a specific session
export async function getSessionAddons(sessionId: number) {
  return await db
    .select({
      id: sessionAddons.id,
      sessionId: sessionAddons.sessionId,
      addonId: sessionAddons.addonId,
      quantity: sessionAddons.quantity,
      priceAtPurchase: sessionAddons.priceAtPurchase,
      name: addons.name,
    })
    .from(sessionAddons)
    .innerJoin(addons, eq(sessionAddons.addonId, addons.id))
    .where(eq(sessionAddons.sessionId, sessionId));
}

// Add an addon to a session (upsert quantity if already added)
export async function addAddonToSession(sessionId: number, addonId: number, quantity: number) {
  const [addon] = await db.select().from(addons).where(eq(addons.id, addonId));
  if (!addon) throw new Error('Addon not found');

  // Check if this addon is already linked to this session
  const [existing] = await db
    .select()
    .from(sessionAddons)
    .where(and(eq(sessionAddons.sessionId, sessionId), eq(sessionAddons.addonId, addonId)));

  if (existing) {
    await db
      .update(sessionAddons)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(sessionAddons.id, existing.id));
  } else {
    await db.insert(sessionAddons).values({
      sessionId,
      addonId,
      quantity,
      priceAtPurchase: addon.price,
    });
  }

  revalidatePath('/dashboard');
}

// Remove/delete an addon from a session
export async function removeAddonFromSession(sessionAddonId: number) {
  await db.delete(sessionAddons).where(eq(sessionAddons.id, sessionAddonId));
  revalidatePath('/dashboard');
}
