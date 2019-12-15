postMessage("worker running");
importScripts("browserMqtt.js");

const client = mqtt.connect("wss://test.mosquitto.org:8081");

client.on("message", function(topic, payload) {
  const text = [topic, payload].join(": ");
  new Notification("MQTT Message", {
    body: text
  });
  postMessage(text);
});

["connect", "reconnect", "close", "disconnect"].forEach(event => {
  client.on(event, () => {
    postMessage(`${event}ed`);
  });
});

client.on("error", error => {
  postMessage(`Error: ${error}`);
});

client.subscribe("mqtt/demo");

postMessage("started");
