/** Validates that a string is a positive number (integer or decimal). */
export const isValidAmount = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/** Validates a YYYY-MM-DD date string. */
export const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/** Validates reminder days is a positive integer between 1 and 30. */
export const isValidReminderDays = (value: string): boolean => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 1 && num <= 30;
};

/** Validates subscription name is non-empty and reasonable length. */
export const isValidName = (value: string): boolean =>
  value.trim().length >= 1 && value.trim().length <= 50;
