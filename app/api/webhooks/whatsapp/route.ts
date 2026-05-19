import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, message, sessionData } = body;

    // TODO: Connect this to the local whatsapp-web.js bot
    // E.g., fetch('http://local-whatsapp-bot-ip:port/send', { method: 'POST', body: JSON.stringify({ phone, message }) })
    
    console.log(`[WhatsApp Webhook] Sending message to ${phone}: ${message}`);
    console.log(`[WhatsApp Webhook] Session Data:`, sessionData);

    // Mock success
    return NextResponse.json({ success: true, message: 'Message sent to WhatsApp bot queue.' });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
