const print = message => {
  document.body.innerHTML += message + "<br/>";
};

const check = () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("No Service Worker support!");
  }
  if (!("PushManager" in window)) {
    throw new Error("No Push API Support!");
  }
};

const registerServiceWorker = async () => {
  const swRegistration = await navigator.serviceWorker.register("service.js");
  return swRegistration;
};

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission();
  return permission;
};

const getConfig = () => {
  const defaultUri = "wss://test.mosquitto.org:8081/mqtt";
  const defaultTopic = "test-topic";

  const params = new URLSearchParams(window.location.search);
  const uri = params.get("uri") || defaultUri;
  const topic = params.get("topic") || defaultTopic;
  const test = /true/i.test(params.get("test"));

  return {
    uri,
    topic,
    test
  };
};

const main = async () => {
  try {
    check();
    const swRegistration = await registerServiceWorker();
    const permission = await requestNotificationPermission();
    print(`Notification permission: ${permission}`);

    const config = getConfig();
    print(`Config: ${JSON.stringify(config)}`);
    const { uri, topic, test } = config;

    const worker = new Worker("mqtt-worker.js");
    worker.postMessage({
      kind: "init",
      uri,
      topic
    });

    worker.addEventListener("message", event => {
      const { kind, message } = event.data;
      if (kind === "notification" && permission === "granted") {
        swRegistration.showNotification("New message", {
          body: message
        });
      }

      if (kind === "print") {
        print(`mqtt-worker: ${message}`);
      }

      if (kind === "connected" && test) {
        worker.postMessage({
          kind: "message",
          message: "Initial test message",
          topic
        });
      }
    });
  } catch (error) {
    print(error);
  }
};

main();
