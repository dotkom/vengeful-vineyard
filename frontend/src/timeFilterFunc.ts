export const shouldDisplay = (
  dateGiven: Date,
  onlyShowAfterDate: Date,
  onlyShowBeforeDate: Date
): boolean => {
  return (
    (dateGiven.getTime() >= onlyShowAfterDate.getTime() &&
      new Date(dateGiven).getTime() <= onlyShowBeforeDate.getTime()) ||
    (new Date(dateGiven).getDate() == onlyShowAfterDate.getDate() &&
      new Date(dateGiven).getMonth() == onlyShowAfterDate.getMonth() &&
      new Date(dateGiven).getFullYear() == onlyShowAfterDate.getFullYear()) ||
    (new Date(dateGiven).getDate() == onlyShowBeforeDate.getDate() &&
      new Date(dateGiven).getMonth() == onlyShowBeforeDate.getMonth() &&
      new Date(dateGiven).getFullYear() == onlyShowBeforeDate.getFullYear())
  );
};
