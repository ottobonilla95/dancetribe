import { ZODIAC_SIGNS } from "@/constants/zodiac";

export const getZodiacSign = (dateOfBirth: Date | string) => {
  if (!dateOfBirth) return null;
  
  const date = new Date(dateOfBirth);
  // Use UTC methods to avoid timezone issues
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  for (const { sign, emoji, start, end } of ZODIAC_SIGNS) {
    const [startMonth, startDay] = start;
    const [endMonth, endDay] = end;
    
    // Handle signs that span across year boundary (like Capricorn)
    if (startMonth > endMonth) {
      // Sign spans December-January
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return { sign, emoji };
      }
    } else {
      // Normal case: sign within same year
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return { sign, emoji };
      }
    }
  }
  
  return null;
}; 