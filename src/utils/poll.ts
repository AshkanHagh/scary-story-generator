export type PollConfig = {
  pollInterval: number;
  maxWaitTime?: number;
};

export function pollUntil<T>(
  fetchFn: () => Promise<T>,
  shouldResolve: (data: T) => boolean,
  config: PollConfig,
): Promise<T> {
  const { pollInterval, maxWaitTime = Infinity } = config;
  const startTime = Date.now();

  const result: Promise<T> = new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const data = await fetchFn();
        if (shouldResolve(data)) {
          resolve(data);
          return;
        }

        if (Date.now() - startTime >= maxWaitTime) {
          resolve(data);
          return;
        }

        // eslint-disable-next-line
        setTimeout(checkStatus, pollInterval);
      } catch (error: unknown) {
        reject(error as Error);
      }
    };

    checkStatus();
  });

  return result;
}
