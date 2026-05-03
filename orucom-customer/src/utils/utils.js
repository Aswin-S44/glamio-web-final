import { format, isValid } from 'date-fns';

export const formatText = text =>
  text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatTimestamp = timestamp => {
  if (!timestamp || !timestamp.seconds) return '';
  try {
    const date = new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000,
    );
    return format(date, 'dd MMM yyyy');
  } catch {
    return '';
  }
};

export const convertFIrstCharToUpper = s => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const generateRandomName = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const isShopOpen = openingHours => {
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = dayOrder[new Date().getDay()];

  for (const entry of openingHours) {
    const [daysPart] = entry.split(':');
    if (daysPart.includes('-')) {
      const [startDay, endDay] = daysPart.split('-').map(d => d.trim());
      const startIndex = dayOrder.indexOf(startDay);
      const endIndex = dayOrder.indexOf(endDay);
      const todayIndex = dayOrder.indexOf(today);

      if (
        startIndex !== -1 &&
        endIndex !== -1 &&
        todayIndex >= startIndex &&
        todayIndex <= endIndex
      ) {
        return true;
      }
    } else {
      if (daysPart.includes(today)) return true;
    }
  }
  return false;
};

export function generateRandomUid() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < 28; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

export const formatDate = dateString => {
  if (!dateString) return '-';

  const parts = dateString.split('-');
  if (parts.length !== 3) return '-';

  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (!isValid(date)) return '-';

  return format(date, 'dd MMM yyyy');
};

export const formattedDate = incomingDate => {
  if (!incomingDate) return '';
  const date = new Date(incomingDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
};
