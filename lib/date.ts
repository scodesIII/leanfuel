// lib/date.ts
export const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

export const addDays = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return normalizeDate(d);
};


export const parseLocalDate = (dateString: string): Date => {
  // dateString is "YYYY-MM-DD"
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create date in LOCAL timezone, not UTC
  return new Date(year, month - 1, day);
};

export const dateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getOrdinalSuffix = (day: number): string => {
  const remainder100 = day % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return 'th';

  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}


export const formatLongDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();

  return `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}`;
}