function enableAudio() {
  const button = document.getElementById("audioButton");
  button.innerText = "audio enabled";
  button.disabled = true;
}

const print = message => {
  const timestamp = new Date().toISOString();
  const hour = timestamp.substring(
    timestamp.indexOf("T") + 1,
    timestamp.indexOf(".")
  );
  document.getElementById("output").innerHTML += `[${hour}] ${message}<br/>`;
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

const addDefaultConfig = () => {
  const defaultUri = "wss://test.mosquitto.org:8081/mqtt";
  const defaultTopic = "test-topic";
  const defaultAudio = "https://springfieldfiles.com/sounds/homer/candotht.mp3";

  const params = new URLSearchParams(window.location.search);
  const uri = params.get("uri") || defaultUri;
  const topic = params.get("topic") || defaultTopic;
  const audio = params.get("audio") || defaultAudio;

  document.getElementById("uri").value = uri;
  document.getElementById("topic").value = topic;
  document.getElementById("audio").value = audio;
};

const getConfig = () => {
  const uri = document.getElementById("uri").value;
  const topic = document.getElementById("topic").value;
  const audio = document.getElementById("audio").value;

  return {
    uri,
    topic,
    audio
  };
};

let connect = () => {};
let onMessage = () => {};
let test = () => {};

const main = async () => {
  try {
    check();
    addDefaultConfig();

    const swRegistration = await registerServiceWorker();
    const permission = await requestNotificationPermission();
    print(`Notification permission: ${permission}`);

    const worker = new Worker("mqtt-worker.js");
    worker.addEventListener("message", event => onMessage(event));

    connect = () => {
      const config = getConfig();
      print(`Config: ${JSON.stringify(config)}`);
      const { uri, topic, audio } = config;
      worker.postMessage({
        kind: "init",
        uri,
        topic
      });

      test = () => {
        worker.postMessage({
          kind: "message",
          message: "Test message",
          topic
        });
      };

      onMessage = event => {
        const { kind, message } = event.data;
        if (kind === "notification" && permission === "granted") {
          swRegistration.showNotification("New message", {
            body: message
          });

          // user interacted with the page so we should be allowed to play
          if (audio !== "") {
            new Audio(audio).play();
          }
        }

        if (kind === "print") {
          print(`mqtt-worker: ${message}`);
        }
      };
    };

    print("Ready to connect.");
  } catch (error) {
    print(error);
  }
};

window.onload = main;
