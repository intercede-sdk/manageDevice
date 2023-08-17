import express from "express";
import bodyParser from "body-parser";

import {
  authenticate,
  createUser,
  createRequest,
  getUser,
  getUserDevices,
  cancelDevice,
} from "./src/rest.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.route("/addUserRequestCard").get((_, res) => {
  authenticate().then((token) =>
    createUser({
      employeeId: "123456",
      token,
    })
      .then((user) =>
        createRequest({
          guid: user.id,
          token,
        })
      )
      .then((request) =>
        res.send(`Request created for user: ${JSON.stringify(request)}`)
      )
      .catch((err) => {
        console.log(err);
        res.send(`Unable to create request: ${err}`);
      })
  );
});

app.route("/cancelCard").get((_, res) => {
  authenticate()
    .then((token) =>
      getUser({
        employeeId: "123456",
        token,
      })
        .then((user) =>
          getUserDevices({
            guid: user.id,
            token,
          })
        )
        .then((device) =>
          cancelDevice({
            guid: device.id,
            token,
          }).then((result) =>
            res.send(`Response from cancellation: ${JSON.stringify(result)}`)
          )
        )
    )
    .catch((err) => {
      console.log(err);
      res.send(`Unable to cancel device: ${err}`);
    });
});

app.route("/*").get((_, res) => {
  res.send(
    "<a href='addUserRequestCard'>Add User / Request Card</a><br/><a href='cancelCard'>Cancel Card</a>"
  );
});

app.listen(PORT, () => console.log(`your server is running on port ${PORT}`));
