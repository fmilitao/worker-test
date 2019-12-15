importScripts("paho-mqtt.js");

function print(message, notify = false) {
  postMessage(
    JSON.stringify({
      message,
      notify
    })
  );
}

async function main() {
  // const uri = "ws://broker.mqttdashboard.com:8000/mqtt";
  const uri = "wss://test.mosquitto.org:8081/mqtt";

  const id = Math.round(Math.random() * 10e10).toString(16);
  const clientId = `clientId-${id}`;

  print("v7");
  print(`${uri} - ${clientId}`);

  const client = new Paho.Client(uri, clientId);
  console.log(client);

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect({ onSuccess: onConnect });

  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    print("onConnect");
    client.subscribe("World");
    message = new Paho.Message("Hello");
    message.destinationName = "World";
    client.send(message);
  }

  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      print("onConnectionLost:" + responseObject.errorMessage);
    }
  }

  // called when a message arrives
  function onMessageArrived(message) {
    print("onMessageArrived:" + message.payloadString);
    print(message.payloadString, true);
  }
}

main();
