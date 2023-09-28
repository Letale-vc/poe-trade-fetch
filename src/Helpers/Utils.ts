const DELAY = 10;

export const delay = (seconds = DELAY) => {
  const timeInMilliseconds = seconds * 1200;
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeInMilliseconds);
  });
};
