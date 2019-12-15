// for within NodeJS
var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://test.mosquitto.org");

const topic = "test-topic-1";
client.on("connect", function() {
  client.subscribe(topic, function(err) {
    // if (!err) {
    //   client.publish("presence", "Hello mqtt");
    // }
  });
  console.log("connected");
});

setTimeout(() => {
  console.log("sending");
  client.publish(topic, "test1");
}, 1000);

client.on("message", function(topic, message) {
  // message is Buffer
  console.log(topic.toString());
  console.log(message.toString());
  // client.end();
});
