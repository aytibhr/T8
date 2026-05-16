export function calculateBilling(
  durationMinutes: number,
  ratePerHour: number,
  isMember: boolean
) {
  // Base logic for T8 Coins calculation
  const creditsNeeded = Math.ceil(durationMinutes / 15) * 1;
  const xpEarned = Math.ceil(durationMinutes / 15) * 10;
  
  // Base logic for cash calculation
  const cashPrice = (durationMinutes / 60) * ratePerHour;

  if (isMember) {
    return {
      type: 'member',
      creditsToDeduct: creditsNeeded,
      xpToAward: xpEarned,
      cashPrice: 0,
      message: `${creditsNeeded} T8 Coins will be deducted. Player earned ${xpEarned} XP!`,
    };
  }

  return {
    type: 'non-member',
    creditsToDeduct: 0,
    xpToAward: 0,
    cashPrice: Math.round(cashPrice),
    message: `Total bill is ₹${Math.round(cashPrice)}. Cash or UPI accepted.`,
  };
}
