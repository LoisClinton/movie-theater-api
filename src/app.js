const express = require("express");
const app = express();
const showRouter = require("../routes/shows.js");
const userRouter = require("../routes/users.js");

app.use("/shows", showRouter);
app.use("/users", userRouter);

app.use(express.json());
app.use(express.urlencoded());

module.exports = app;
