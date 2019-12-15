self.addEventListener("install", () => {
  console.log("installing");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("active");
});
