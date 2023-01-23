import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

const clientId = process.env.MYID_API_USER;
const clientSecret = process.env.MYID_API_SECRET;
const authServer = new URL(
  "/web.oauth2/connect/token",
  process.env.MYID_API_SERVER
);
const apiServer = new URL("/rest.core/api", process.env.MYID_API_SERVER);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.route("/contact/:contactId").get((req, res) => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  fetch(authServer, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  })
    .then((response) => response.json())
    .catch(() => {
      res.send(`Unable to get details for ${req.params.contactId}`);
    })
    .then((response) =>
      fetch(`${apiServer}/people/${req.params.contactId}`, {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      })
    )
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      res.send(JSON.stringify(response));
    })
    .catch((err) => {
      res.send(`Unable to get details for ${req.params.contactId} - ${err}`);
    });
});

// For now, all other URLs don't show anything
app.route("/*").get((_, res) => {
  res.send("");
});

app.listen(PORT, () => console.log(`your server is running on port ${PORT}`));
