# Introduction

This sample node.js web application connects to the MyID Core API to add a user, request a credential for that user, and cancel a credential issued to that user.

# Set up

The following environment variables need to be set up:

| Variable            | Purpose                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| MYID_API_SERVER     | This is the location of the MyID Core API                                                           |
| MYID_API_USER       | This is the client identifier for connecting to the MyID Core API                                   |
| MYID_API_SECRET     | This is the client shared secret for connecting to the MyID Core API                                |
| NODE_EXTRA_CA_CERTS | (Optional) This needs to be set if SSL trust issues exist with the server hosting the MyID Core API |

Note that we currently deploy the MyID Core API and MyID web.oauth2 webservice on the same server

## Authentication

A general overview of how to set up authentication to the `MYID_API_SERVER` is described in our [server-to-server authentication document](https://forums.intercede.com/wp-content/uploads/Flare/MyID-v1205-PIV/index.htm#MyID%20Core%20API/Authentication/Configuring%20MyID%20for%20server-to-server%20authentication.htm).
Specifically, the following is suggested for this demo code:

1. Create a Role in MyID that allows us "Add Person", "Request Card", and "Cancel Credential"
1. Give Logon Method of "Client Credentials OAuth2" to this role
1. Create a person in MyID with this role. Make a note of their LogonName, as this will be needed as the `MyIDLogonName` in the web.oauth2 config mentioned later
1. Open powershell prompt in web.ouath2 folder, and run GenClientSecret.ps1.

   ```
   PS C:\Program Files\Intercede\MyID\web.oauth2> C:\Program Files\Intercede\MyID\web.oauth2\GenClientSecret.ps1

   client secret: 07025f77-e54e-46eb-a2eb-079f89586573
   SHA256+base64: WmNN/+Ifjeb/djkhXB9YKAbfR8wbDfoWpEGMfux5DHU=
   ```

1. `MYID_API_SECRET` is set to the client secret value (e.g. `07025f77-e54e-46eb-a2eb-079f89586573`)
1. Add the following node to web.oauth2\appsettings.production.json in Clients array, replacing `<secret>` with the SHA256+base64 value, and `<logonName>` with the LogonName of the user created earlier.

   ```json
   {
     "ClientId": "get.user",
     "ClientName": "Get user service",
     "ClientSecrets": [
       {
         "Value": "<secret>"
       }
     ],
     "AllowedGrantTypes": ["client_credentials"],
     "AllowedScopes": ["myid.rest.basic"],
     "Properties": {
       "MyIDLogonName": "<logonName>"
     }
   }
   ```

1. `MYID_API_USER` is set to the `ClientId` value above (i.e. `get.user`)

# Running

Install node packages with `npm install`

Develop with `npm run dev`, which allows hot reloading of node.js server, and hosts a local server at http://localhost:3000

Run on server with `node index.js`

This prototype makes a number of simple MyID Core API calls:

- `POST /people`: Create a user. ideally code should also confirm user with the provided logonName doesn't already exist

- `POST /people/{person-guid}/requests`: Create a credential request for a user

- `GET /people?employeeId={employeeId}`: Perform a search finding users with the provided employeeId. Code select first person if multiple records are returned

- `GET /people/{person-guid}/device`: Perform a search finding devices associated with a specific user. Code select first device if multiple records are returned

- `POST /devices/{device-guid}/cancel`: Cancel the specified credential

Error checking is minimal, and is intending to be run in dev mode (`npm run dev`) to test various behaviour of calls, and allow the hard-coded values to be changed to suit the environment this is tested against.
`employeeId` is hard-coded to "123456"
`group.id` user is created within is hard-coded to "BBF6B7A9-460C-48FD-AB9E-7DB163A1D65D"
`credProfile.id` credential request uses is hard-coded to "0A5915F9-B308-4403-9C9F-F2A568E57C9B"

The interface is basic, with a home page with two links:

- a link to the page that adds a user, and requests a card for that user
  (MyID would need to be used to collect the card request, before using the link below)
- a link to the page that cancels a card issued to that user
