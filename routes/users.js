const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();

router.use(express.json());
//GET /
router.get("/", async (request, response) => {
  const user = await User.findAll();
  response.send(user);
});

// GET /:id
router.get("/:id", async (request, response) => {
  const id = request.params.id;
  const user = await User.findByPk(id);
  response.send(user);
});

// POST
router.post("/", async (request, response) => {
  await User.create({
    username: request.body.username,
    password: request.body.password,
  });

  const user = await User.findAll();
  response.send(user);
});

//PUT
router.put("/:id", async (request, response) => {
  await User.update(
    {
      username: request.body.username,
      password: request.body.password,
    },
    {
      where: {
        id: request.params.id,
      },
    }
  );
  const thisUser = await User.findByPk(request.params.id);
  response.send(thisUser);
});

//DELETE
router.delete("/:id", async (request, response) => {
  await User.destroy({
    where: {
      id: await request.params.id,
    },
  });
  console.log("Item deleted");
  response.send(await User.findAll());
});

// TODO

// GET all shows watched by a user (user id in req.params)
//      For example, /users/2/shows should return all the shows for the 2nd user.

// PUT associate a user with a show they have watched (update and add a show if a user has watched it).
//     For example, a PUT request to /users/2/shows/9 should add the 9th show to the 2nd user.

// Use server-side validation in your routes to ensure that:
//     The username must be an email address.

//DONE
// GET all users
// GET one user

module.exports = router;

//VALIDATION:

// isEmail(options?: {
//     allow_display_name?: boolean;
//     allow_utf8_local_part?: boolean;
//     require_tld?: boolean;
//     ignore_max_length?: boolean;
//     allow_ip_domain?: boolean;
//     domain_specific_validation?: boolean;
//     blacklisted_chars?: string;
//     host_blacklist?: string[];
//     host_whitelist?: string[];
//   }): ValidationChain
