export const jsonStringify = <T>(value: T): string => {
  return JSON.stringify(value, null, 2);
};
