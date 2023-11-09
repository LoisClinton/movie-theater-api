const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();
const { check, validationResult } = require("express-validator");

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

//GET to show a users watched shows
router.get("/:id/shows", async (request, response) => {
  const id = request.params.id;

  const userShows = await User.findOne({
    where: {
      id: id,
    },
    include: Show,
  });

  if (userShows == null) {
    response.send(`ERROR No user with id:${id}  found!!`);
  } else if (userShows.shows == null) {
    response.send(`${userShows.username} has watched: 0 shows`);
  } else {
    const arrOfShows = [];
    for (let showWatched of userShows.shows) {
      arrOfShows.push(showWatched.title);
    }
    response.send(`user: ${userShows.username} has watched: ${arrOfShows}`);
  }
});

//PUT to edit user
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

//PUT to add shows to user
router.put("/:iduser/shows/:idshow", async (request, response) => {
  const user = await User.findByPk(request.params.iduser);
  const show = await Show.findByPk(request.params.idshow);
  try {
    if (await user.hasShow(show)) {
      response.send(`${user.username} has already watched ${show.title}!`);
    } else {
      await user.addShow(show);
      response.send(
        `Successfully added ${show.title} to user:${user.username}'s watched shows!`
      );
    }
  } catch (error) {
    response.send(`Something went wrong ${console.error(error)}`);
  }
});

// body('email').isEmail().withMessage('Not a valid e-mail address');
// POST To create a new user
router.post("/", async (request, response) => {
  await User.create({
    username: request.body.username,
    password: request.body.password,
  });

  const user = await User.findAll();
  response.send(user);
});

//DELETE To delete an account
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

// POST?
// Use server-side validation in your routes to ensure that:
//     The username must be an email address.

// Possibly implement a better method that try and catch in my put association request

//DONE

// GET all users
// GET one user
// GET all shows watched by a user (user id in req.params)
//      For example, /users/2/shows should return all the shows for the 2nd user.
// PUT associate a user with a show they have watched (update and add a show if a user has watched it).
//     For example, a PUT request to /users/2/shows/9 should add the 9th show to the 2nd user.

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
