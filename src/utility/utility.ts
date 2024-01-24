export async function delay(seconds = 10) {
  const timeInMilliseconds = seconds * 1000;
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeInMilliseconds);
  });
}
