importScripts("paho-mqtt.js");

function sendMessageToMainThread(message, kind) {
  postMessage({
    message,
    kind
  });
}

function print(message) {
  sendMessageToMainThread(message, "print");
}

let client = null;

function initialize(uri, topic) {
  const id = Math.round(Math.random() * 10e10).toString(16);
  const clientId = `clientId-${id}`;

  print(`uri: ${uri}`);
  print(`topic: ${topic}`);
  print(`clientId: ${clientId}`);

  client = new Paho.Client(uri, clientId);

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect({ onSuccess: onConnect });

  // called when the client connects
  function onConnect() {
    print("connected");
    client.subscribe(topic);

    sendMessageToMainThread("connected", "connected");
  }

  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      print(`connection lost - ${responseObject.errorMessage}`);
    }
  }

  // called when a message arrives
  function onMessageArrived(message) {
    print(`received '${message.payloadString}'`);
    sendMessageToMainThread(message.payloadString, "notification");
  }
}

function sendMessageToMqttTopic(topic, text) {
  const message = new Paho.Message(text);
  message.destinationName = topic;
  client.send(message);
}

self.addEventListener("message", event => {
  const { kind } = event.data;
  if (kind === "init") {
    if (client !== null) {
      print("Error: client already initialized");
    } else {
      const { uri, topic } = event.data;
      initialize(uri, topic);
    }
  }
  if (kind === "message") {
    const { message, topic } = event.data;
    sendMessageToMqttTopic(topic, message);
  }
});
