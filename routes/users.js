const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.use(express.json());

//GET All (done)
router.get("/", async (request, response) => {
  const user = await User.findAll();
  const usernameArr = [];
  for (let person of user) {
    let tempObj = {};
    tempObj.id = person.id;
    tempObj.username = person.username;
    usernameArr.push(tempObj);
  }
  response.send(usernameArr);
});

//GET All Admin (done)
router.get(
  "/admin",
  [
    check("adminPassword", "you're not authorized to see this content")
      .not()
      .isEmpty()
      .equals("A+?db4?aQ2d{k"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const user = await User.findAll({ include: Show });
      response.send(user);
    }
  }
);

// GET By Id (done)
router.get(
  "/:id",
  [
    check("id")
      .custom(async (value) => {
        const userExists = await User.findOne({ where: { id: value } });
        if (!userExists) {
          throw new Error("There is no user with this id in the system!");
        }
      })
      .withMessage("There is no user with this id in the system!"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const id = request.params.id;
      const user = await User.findByPk(id);
      response.send({ username: user.username });
    }
  }
);

//GET a users watched shows.
router.get(
  "/:id/shows",
  [
    check("id")
      .custom(async (value) => {
        const userExists = await User.findOne({ where: { id: value } });
        if (!userExists) {
          throw new Error("There is no user with this id in the system!");
        }
      })
      .withMessage("There is no user with this id in the system!")
      .custom(async (value) => {
        const userShows = await User.findOne({
          where: {
            id: value,
          },
          include: Show,
        });
        if (userShows.shows.length == 0) {
          throw new Error("This user hasnt watched any shows yet!");
        }
      })
      .withMessage("This user hasnt watched any shows yet!"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const id = request.params.id;
      const userShows = await User.findOne({
        where: {
          id: id,
        },
        include: Show,
      });
      const arrOfShows = [];
      for (let showWatched of userShows.shows) {
        arrOfShows.push(showWatched.title);
      }
      response.send(`user: ${userShows.username} has watched: ${arrOfShows}`);
    }
  }
);

//PUT to edit user by id
router.put(
  "/:id",
  [
    check("id")
      .custom(async (value) => {
        const userExists = await User.findOne({ where: { id: value } });
        if (!userExists) {
          throw new Error("There is no user with this id in the system!");
        }
      })
      .withMessage("There is no user with this id in the system!"),
    check("username")
      .isEmail()
      .withMessage("Please enter a valid email address!")
      .not()
      .isEmpty()
      .withMessage("Email cannot be empty!"),
    check("password")
      .custom
      // /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/gm   --regex to meet that criteria
      ().withMessage(`Password must contain:
- at least 8 characters
- must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number
- Can contain special characters`),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
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
    }
  }
);

//PUT to add a show to a user
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

// POST to create a new user
router.post(
  "/",
  [
    check(
      "username",
      "username must be an email between 5 to 25 characters and cannot be empty"
    )
      .isLength({ min: 5, max: 25 })
      .isEmail()
      .not()
      .isEmpty()
      .trim(),
    check("password", "password cannot be empty").not().isEmpty().trim(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      await User.create({
        username: request.body.username,
        password: request.body.password,
      });

      const users = await User.findAll();
      response.send(users);
    }
  }
);

//DELETE To delete a user account
router.delete("/:id", async (request, response) => {
  await User.destroy({
    where: {
      id: request.params.id,
    },
  });
  console.log("Item deleted");
  response.send(await User.findAll());
});

// TODO
// editied get all to only return the users usernames
// added a personal Get all with a password to get all
// editied get by Id to only return the users username
// added validation checks to check if there is a user with specified id
// added an admin method that returns the whole user and their associated shows
module.exports = router;
