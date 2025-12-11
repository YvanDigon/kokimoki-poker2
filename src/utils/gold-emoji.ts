/**
 * Convert gold amount to emoji representation
 * 💰 = 25 gold (money bag)
 * 🪙 = 1-24 gold (coin)
 */
export function getGoldEmoji(amount: number): string {
	if (amount <= 0) return '';
	if (amount < 25) return '🪙';
	
	const moneyBags = Math.floor(amount / 25);
	return '💰'.repeat(moneyBags);
}
