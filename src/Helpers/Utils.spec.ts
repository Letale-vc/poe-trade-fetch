import { delay } from './Utils';

describe('delay', () => {
  jest.useFakeTimers();

  it('should delay execution by the specified number of seconds', async () => {
    const seconds = 2;
    const promise = delay(seconds);
    jest.advanceTimersByTime(seconds * 1000);
    await expect(promise).resolves.toBeUndefined();
  });
});
