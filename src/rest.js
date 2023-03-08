import fetch from "node-fetch";
import loki from "lokijs";

const apiServer = new URL("/rest.core/api", process.env.MYID_API_SERVER);
const clientId = process.env.MYID_API_USER;
const clientSecret = process.env.MYID_API_SECRET;
const authServer = new URL(
  "/web.oauth2/connect/token",
  process.env.MYID_API_SERVER
);

const db = new loki("getUser.db");
const tokens = db.addCollection("tokens");

export function authenticate() {
  const validToken = tokens.findOne({ expires: { $gt: Date.now() + 5000 } });
  if (validToken) {
    return Promise.resolve(validToken.token.access_token);
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return fetch(authServer, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  })
    .then((response) => response.json())
    .then((token) => {
      tokens.clear();
      tokens.insert({ token, expires: Date.now() + token.expires_in * 1000 });
      return token.access_token;
    })
    .catch((e) => {
      console.log("Authentication failure", e);
    });
}

export function getData({ user, token }) {
  return fetch(`${apiServer}/people/${user}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
}

export function getImage({ imageUrl, token }) {
  return fetch(`${apiServer}/${imageUrl}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.arrayBuffer())
    .then((blob) => Buffer.from(blob).toString("base64"));
}
