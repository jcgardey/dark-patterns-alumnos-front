// returns a date in the form 'Mon Apr 17'
export const dateString = (aDate, locale) =>
  aDate.toLocaleDateString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const differenceInDays = (aDate, anotherDate) =>
  parseInt((aDate.getTime() - anotherDate.getTime()) / (1000 * 3600 * 24));
