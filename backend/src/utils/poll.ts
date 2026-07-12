export type PollConfig = {
  interval: number;
  timeout?: number;
};

export function pollUntil<T>(
  fetchFn: () => Promise<T>,
  shouldResolve: (data: T) => boolean,
  config: PollConfig,
): Promise<T> {
  const startTime = Date.now();
  return new Promise<T>((resolve, reject) => {
    const checkStatus = () => {
      fetchFn()
        .then((result) => {
          // should resolve fn is a check function base on the value of return function
          if (shouldResolve(result)) {
            return resolve(result);
          }
          // returns at a time if the shouldResolve fn still not true
          if (Date.now() - startTime >= (config.timeout || 5000)) {
            return resolve(result);
          }
          setTimeout(checkStatus, config.interval);
        })
        .catch((error: Error) => {
          reject(error);
        });
    };

    checkStatus();
  });
}
