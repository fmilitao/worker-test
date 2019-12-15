postMessage("worker running");
importScripts("paho-mqtt.js");

// Create a client instance
var client = new Paho.MQTT.Client(
  location.hostname,
  Number(location.port),
  "clientId"
);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("World");
  message = new Paho.MQTT.Message("Hello");
  message.destinationName = "World";
  client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
}

// const client = mqtt.connect("wss://test.mosquitto.org:8081");

// client.on("message", function(topic, payload) {
//   const text = [topic, payload].join(": ");
//   new Notification("MQTT Message", {
//     body: text
//   });
//   postMessage(text);
//   client.end();
// });

// ["connect", "reconnect", "close", "disconnect"].forEach(event => {
//   client.on(event, () => {
//     postMessage(`${event}ed`);
//   });
// });

// client.on("error", error => {
//   postMessage(`Error: ${error}`);
// });

// client.subscribe("mqtt/demo");

// postMessage("started");
