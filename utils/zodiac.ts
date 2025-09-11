import { ZODIAC_SIGNS } from "@/constants/zodiac";

export const getZodiacSign = (dateOfBirth: Date | string) => {
  if (!dateOfBirth) return null;
  
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const { sign, emoji, start, end } of ZODIAC_SIGNS) {
    const [startMonth, startDay] = start;
    const [endMonth, endDay] = end;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      (startMonth > endMonth && (month === startMonth || month === endMonth))
    ) {
      return { sign, emoji };
    }
  }
  
  return null;
}; 