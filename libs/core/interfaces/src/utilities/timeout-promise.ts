export class PromiseTimeoutError extends Error {}

export const timeoutPromise = (
  promise: Promise<unknown>,
  time = 1000,
  exception = new PromiseTimeoutError(),
): Promise<unknown> => {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise,
    new Promise((_r, rej) => (timer = setTimeout(rej, time, exception))),
  ]).finally(() => clearTimeout(timer));
};
