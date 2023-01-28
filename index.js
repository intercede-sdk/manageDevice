import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";

import { authenticate, getData, getImage } from "./src/rest.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.route("/contact/:contactId").get((req, res) => {
  authenticate()
    .then((response) =>
      getData({
        user: req.params.contactId,
        token: response.access_token,
      }).then((data) =>
        getImage({
          imageUrl: data.photo.href,
          token: response.access_token,
        }).then((img) => {
          // console.log(data); // use this to determine what can be shown
          ejs.renderFile("userDetails.ejs", { data, img }, (_, str) => {
            res.send(str);
          });
        })
      )
    )
    .catch((err) => {
      console.log(err);
      res.send(`Unable to get details for ${req.params.contactId}`);
    });
});

// For now, all other URLs don't show anything
app.route("/*").get((_, res) => {
  res.send("");
});

app.listen(PORT, () => console.log(`your server is running on port ${PORT}`));
