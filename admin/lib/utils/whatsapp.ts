export function formatWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}

export const WA_TEMPLATES = {
  MEMBERSHIP_WELCOME: (data: { name: string, planName: string, price: number, coins: number, hours: number }) => `
*--- LEVEL UP COMPLETE ---*

Hey *${data.name}*, 

Welcome to the elite ranks of *Terminal 8 Gaming Hub*!

Your membership has been activated:
[+] *Plan:* ${data.planName}
[+] *Price:* ₹${data.price}
[+] *T8 Coins Added:* ${data.coins}
[+] *Hours Included:* ${data.hours} hrs

*YOUR PERKS:*
> Instant Station Allotment
> VIP Gaming Zone Access
> Exclusive Member Tournaments
> Monthly Bonus Credits

Time to dominate the leaderboard! See you at the station.

_GLHF!_
_Team Terminal 8_
  `.trim(),

  BILL_WALKIN: (data: { name: string, hours: number, amount: number, date: string }) => `
*--- TERMINAL 8 - SESSION BILL ---*

Hey *${data.name}*, 

Thanks for playing with us today! Here is your session summary:

>> *Date:* ${data.date}
>> *Play Time:* ${data.hours} mins
>> *Total Amount:* ₹${data.amount}

Hope you enjoyed the vibes! Come back soon to beat your high score.

_Keep Gaming!_
_Team Terminal 8_
  `.trim(),

  BILL_MEMBER: (data: { name: string, hours: number, spent: number, balance: number, date: string }) => `
*--- TERMINAL 8 - MEMBER SESSION ---*

Hey *${data.name}*, 

Great session today! Your T8 account has been updated:

>> *Date:* ${data.date}
>> *Play Time:* ${data.hours} mins
>> *Coins Spent:* ${data.spent}
>> *Remaining Balance:* ${data.balance} Coins

Your VIP journey continues! We're ready for your next quest.

_Team Terminal 8_
  `.trim(),

  EXPIRY_REMINDER: (data: { name: string, daysLeft: number, expiryDate: string }) => `
*!!! TERMINAL 8 - MEMBERSHIP ALERT !!!*

Hey *${data.name}*, 

Your Membership is about to enter 'End Game' mode!

>> *Status:* Expiring in ${data.daysLeft} days
>> *Expiry Date:* ${data.expiryDate}

Don't lose your perks and coin balance! Renew now to keep your streak alive.

_Team Terminal 8_
  `.trim(),

  LOW_COINS: (data: { name: string, balance: number }) => `
*!!! LOW COINS ALERT !!!*

Hey *${data.name}*, 

Your T8 Coin reserves are running low!

>> *Current Balance:* ${data.balance} Coins

Top up now to ensure your next session starts without delay. Don't get stuck at the loading screen!

_Team Terminal 8_
  `.trim()
};
