import { format, isToday, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';

export const formatMessageTime = (date: Date): string => {
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Ieri ' + format(date, 'HH:mm');
  } else {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: it });
  }
};