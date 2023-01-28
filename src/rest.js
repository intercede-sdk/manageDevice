import fetch from "node-fetch";

const apiServer = new URL("/rest.core/api", process.env.MYID_API_SERVER);
const clientId = process.env.MYID_API_USER;
const clientSecret = process.env.MYID_API_SECRET;
const authServer = new URL(
  "/web.oauth2/connect/token",
  process.env.MYID_API_SERVER
);

// TODO - only authenticate if needed
export function authenticate() {
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
    .catch(() => {
      res.send("There has been an error processing this request");
      console.log("Authentication failure");
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
