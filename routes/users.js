const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();

router.use(express.json());

module.exports = router;
