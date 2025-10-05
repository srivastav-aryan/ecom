export const initMock = async () => {
  const { worker } = await import("./browser.js");
  await worker.start({
    serviceWorker: { url: "/mockServiceWorker.js" },
    onUnhandledRequest: "bypass",
  });

  console.log("MSW STARTED IN MOCK MODE");
};
