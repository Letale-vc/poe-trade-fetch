import { delay } from './Utils';

describe('delay', () => {
  jest.useFakeTimers();

  it('should delay execution by the specified number of seconds', async () => {
    const seconds = 2;
    const promise = delay(seconds);
    jest.advanceTimersByTime(seconds * 1000);
    await expect(promise).resolves.toBeUndefined();
  });

  jest.setTimeout(10000); // Збільшити максимальне очікування до 10 секунд
  it('should delay execution by the default number of seconds if no argument is provided', async () => {
    const defaultSeconds = 10;
    const promise = delay();
    jest.advanceTimersByTime(defaultSeconds * 1000);
    await expect(promise).resolves.toBeUndefined();
  });
});
