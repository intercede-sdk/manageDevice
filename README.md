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

1. Create a Role in MyID with access only to View Person - role = "View Users"
1. Give Logon Method of "Client Credentials OAuth2" to this role
1. Create a person in MyID with this role - user logon = "get.users"
1. Open powershell prompt in web.ouath2 folder, and run GenClientSecret.ps1.

   ```
   PS C:\Program Files\Intercede\MyID\web.oauth2> C:\Program Files\Intercede\MyID\web.oauth2\GenClientSecret.ps1

   client secret: 07025f77-e54e-46eb-a2eb-079f89586573
   SHA256+base64: WmNN/+Ifjeb/djkhXB9YKAbfR8wbDfoWpEGMfux5DHU=
   ```

1. `MYID_API_SECRET` is set to the client secret value (e.g. `07025f77-e54e-46eb-a2eb-079f89586573`)
1. Add the following node to web.oauth2\appsettings.production.json in Clients array, replacing `<secret>` with the SHA256+base64 value:

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
       "MyIDLogonName": "get.users"
     }
   }
   ```

1. `MYID_API_USER` is set to the `ClientId` value above (i.e. `get.user`)

# Running

Install node packages with `npm install`

Develop with `npm run dev`, which allows hot reloading of node.js server, and hosts a local server at http://localhost:3000

Run on server with `node index.js`

This prototype captures the JSON response from calling the API, and displays some of that data - including the user photo - using a simple template page if a valid user GUID is provided. Otherwise an error message is shown if the user GUID doesn't match an existing record.
It also tracks the lifetime of the authentication token requested, and only requests a new one once the token has expired.
