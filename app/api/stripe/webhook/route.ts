import { NextResponse } from 'next/server';

// Stripe is not used in this application. This is a stub to prevent build errors.
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
}
