const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const ErrorHandler = require("./middlewares/error-handler");
const MqttHandler = require("./modules/mqtt-interface");

const { UserRoute } = require("./routes/users");
const { StudentRoute } = require("./routes/student");
const { FileManagerRoute } = require("./routes/file-manager");
const { AttendanceRoute } = require("./routes/attendance");

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
const userRoute = new UserRoute();
const studentRoute = new StudentRoute();
const fileManagerRoute = new FileManagerRoute();
const attendanceRoute = new AttendanceRoute();

// Start server

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(ErrorHandler);

// Don't delete
const pubtopic = `mqtt/API/${process.env.MQTT_DEVICEID}`;
const subtopic = "mqtt/RFID/test";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mqttClient = new MqttHandler();
app.post('/publish', (req, res) => {
  const topic = req.body.topic;
  const message = req.body.message;
  mqttClient.publish(topic, message, {qos: 0});
  res.send('Message published to ' + topic + ': ' + message);
});

app.get('/subscribe', (req, res) => {
  const topic = req.body.topic;
  mqttClient.subscribe(topic, {qos: 0});
  res.send('Subscribed to ' + topic);
})

mqttClient.onMessage((topic, message) => {
  // Handle incoming messages here
  console.log(message.toString());
});

const port = process.env.PORT || 3000;
const attendance = require("./routes/attendance");
const student = require("./routes/student");
const user = require("./routes/user");


app.use(cors());
app.use(ErrorHandler);

app.use("/parse", fileManagerRoute.routes);
app.use("/attendance", attendanceRoute.routes);
app.use("/student", studentRoute.routes);
app.use("/user", userRoute.routes);
// app.set("port", process.env.PORT || 3000);

app.listen(port, () => {
    console.log("app running on port:", server.address().port);
});

process.on('SIGINT', () => {
  mqttClient.end();
  process.exit();
});
