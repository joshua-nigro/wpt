const randomDelay = () => {
  return new Promise(resolve => setTimeout(resolve, 50 + 100*Math.random()));
}
const concurrencyLimiter = (max_concurrency) => {
  let pending = 0;
  let waiting = [];
  return async (task) => {
    pending++;
    if (pending > max_concurrency)
      await new Promise(resolve => waiting.push(resolve));
    let result = await task();
    pending--;
    waiting.shift()?.();
    return result;
  };
}
const limiter = concurrencyLimiter(1);
self.onmessage = async (e) => {
  await limiter(async () => {
    while(1) {
      try {
        let response = await fetch(e.data.url, {
          mode: e.data.mode,
          credentials: e.data.credentials,
        });
        if (await response.text() == "done")
          return;
      } catch (fetch_error) {}
      await randomDelay();
    };
  });
};
