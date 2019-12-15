console.log("worker running");
importScripts("browserMqtt.js");

const client = mqtt.connect("wss://test.mosquitto.org:8081");
client.subscribe("mqtt/demo");

client.on("connect", function() {
  console.log("connected");
});

client.on("message", function(topic, payload) {
  const text = [topic, payload].join(": ");
  new Notification("MQTT Message", {
    body: text
  });
  postMessage(text);
});

console.log("stated");
