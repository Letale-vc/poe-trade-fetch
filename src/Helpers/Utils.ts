const DELAY = 15;

export const delay = (seconds = DELAY) => {
  const timeInMilliseconds = seconds * 1000;
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeInMilliseconds);
  });
};
