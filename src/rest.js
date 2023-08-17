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

function postApi({ url, params, token, failMessage }) {
  return fetch(`${apiServer}/${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(params),
  })
    .then((response) => (response.ok ? response : Promise.reject(failMessage)))
    .then((response) => response.json());
}

export function createUser({ employeeId, token }) {
  const params = {
    employeeId,
    enabled: "1",
    contact: {
      emailAddress: "test.user@intercede.com",
    },
    name: {
      first: "Sam",
      last: "Jones",
    },
    group: {
      id: "BBF6B7A9-460C-48FD-AB9E-7DB163A1D65D",
    },
    logonName: employeeId,
    roles: [
      {
        id: "Applicant",
        name: "Applicant",
        scope: "self",
      },
    ],
  };

  return postApi({
    url: "people",
    params,
    token,
    failMessage: "Unable to create user",
  });
}

export function createRequest({ guid, token }) {
  const params = {
    credProfile: { id: "0A5915F9-B308-4403-9C9F-F2A568E57C9B" },
  };

  return postApi({
    url: `people/${guid}/requests`,
    params,
    token,
    failMessage: "Unable to create request",
  });
}

export function getUser({ employeeId, token }) {
  return fetch(`${apiServer}/people?employeeId=${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((users) => users.results?.[0] || Promise.reject("User not found"));
}

export function getUserDevices({ guid, token }) {
  return fetch(`${apiServer}/people/${guid}/devices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(
      (devices) => devices.results?.[0] || Promise.reject("No devices found")
    );
}

export function cancelDevice({ guid, token }) {
  const params = { reason: { statusMappingId: 1 } };
  console.log(guid);
  return postApi({
    url: `devices/${guid}/cancel`,
    params,
    token,
    failMessage: "Unable to cancel",
  });
}
