# Set up

The following environment variables need to be set up:

| Variable            | Purpose                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| MYID_API_SERVER     | This is the location of the MyID Core API                                                           |
| MYID_API_USER       | This is the client identifier for connecting to the MyID Core API                                   |
| MYID_API_SECRET     | This is the client shared secret for connecting to the MyID Core API                                |
| NODE_EXTRA_CA_CERTS | (Optional) This needs to be set if SSL trust issues exist with the server hosting the MyID Core API |

Install node packages with `npm install`

Develop with `npm run dev`, which allows hot reloading of node.js server, and hosts a local server at http://localhost:3000

Run on server with `node index.js`

This prototype captures the JSON response from calling the API, and displays some of that data - including the user photo - using a simple template page if a valid user GUID is provided. Otherwise an error message is shown if the user GUID doesn't match an existing record.
It also tracks the lifetime of the authentication token requested, and only requests a new one once the token has expired.
