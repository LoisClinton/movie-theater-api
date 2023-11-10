const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.use(express.json());

//GET All (done)
router.get("/", async (request, response) => {
  const shows = await Show.findAll();
  const showsArr = [];
  for (let show of shows) {
    const tempObj = {};
    tempObj.title = show.title;
    tempObj.genre = show.genre;
    tempObj.rating = show.rating;
    tempObj.available = show.available;
    showsArr.push(tempObj);
  }
  response.send(showsArr);
});

//GET All Admin (done)
router.get(
  "/admin",
  [
    check("adminPassword", "you're not authorized to see this content")
      .equals("A+?db4?aQ2d{k")
      .not()
      .isEmpty(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const show = await Show.findAll({ include: User });
      response.send(show);
    }
  }
);

// GET By Id (done)
router.get(
  "/:id",
  [
    check("id").custom(async (value) => {
      const showExists = await Show.findOne({ where: { id: value } });
      if (!showExists) {
        throw new Error("There is no show with this id in the system!");
      }
    }),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const id = request.params.id;
      const show = await Show.findByPk(id);
      response.send({
        title: show.title,
        genre: show.genre,
        rating: show.rating,
        available: show.available,
      });
    }
  }
);

//GET shows of a particular genre for example, /shows/genres/Comedy. (done)
router.get(
  "/genres/:genrePick",
  [
    check("genrePick").custom(async (value) => {
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      const thisGenre = capitalizeFirstLetter(value);

      const genreExists = await Show.findAll({
        where: {
          genre: thisGenre,
        },
      });
      if (genreExists.length === 0) {
        throw new Error(
          `There are no shows with the genre ${value} in the system!`
        );
      }
    }),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      const genre = capitalizeFirstLetter(request.params.genrePick);
      const showsWithGenre = await Show.findAll({
        where: {
          genre: genre,
        },
      });
      const arrOfShows = [];
      let count = 0;
      for (let show of showsWithGenre) {
        count++;
        arrOfShows.push(`
${count}) ${show.title}`);
      }
      response.send(
        `Here are the shows with the genre ${genre}: ${arrOfShows}`
      );
    }
  }
);

//GET to show all users who watched this show (done)
router.get(
  "/:id/users",
  [
    check("id").custom(async (value) => {
      const showExists = await Show.findOne({
        where: {
          id: value,
        },
        include: User,
      });
      if (!showExists) {
        throw new Error("There is no show with this id in the system!");
      } else if (showExists.users.length == 0) {
        throw new Error("No users have watched this show yet!");
      }
    }),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const id = request.params.id;
      const showUsers = await Show.findOne({
        where: {
          id: id,
        },
        include: User,
      });
      const arrOfUsers = [];
      for (let userWatched of showUsers.users) {
        arrOfUsers.push(`"${userWatched.username}"`);
      }
      response.send(
        `"${showUsers.title}" has been watched by the users: ${arrOfUsers}`
      );
    }
  }
);

//PUT to update property value of a show (done)
router.put(
  "/:id/updates",
  [
    check(
      "title",
      "title field must be between 3 and 55 characters long and cannot be empty"
    )
      .isLength({ min: 5, max: 55 })
      .not()
      .isEmpty()
      .trim(),
    check("genre", "genre cannot be empty ").not().isEmpty().trim(),
    check(
      "rating",
      "rating field must be a number between 0 and 100 and cannot be empty"
    )
      .optional()
      .isInt({ min: 0, max: 100 }),
    check("available", "available field must be a boolean and cannot be empty")
      .optional()
      .isBoolean(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      const show = await Show.findByPk(request.params.id);
      show.title = request.body.title;
      show.genre = request.body.genre;

      if (request.body.rating) {
        show.rating = request.body.rating;
      }
      if (request.body.available) {
        show.available = request.body.available;
      }
      await Show.update(
        {
          title: show.title,
          genre: show.genre,
          rating: show.rating,
          available: show.available,
        },
        { where: { id: request.params.id } }
      );

      const boop = await Show.findByPk(request.params.id);
      response.send([
        {
          title: show.title,
          genre: show.genre,
          rating: show.rating,
          available: show.available,
        },
      ]);
    }
  }
);

//PUT update the rating of a show. (done)
router.put(
  "/:id/watched",
  [
    check(
      "rating",
      "rating field must be a number between 0 and 100 and cannot be empty"
    )
      .isInt({ min: 0, max: 100 })
      .not()
      .isEmpty(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      await Show.update(
        {
          rating: request.body.rating,
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      response.send(await Show.findByPk(request.params.id));
    }
  }
);

// POST
router.post(
  "/",
  [
    check(
      "title",
      "title field must be between 3 and 55 characters long and cannot be empty"
    )
      .isLength({ min: 5, max: 55 })
      .not()
      .isEmpty()
      .trim(),
    check("genre", "genre cannot be empty ").not().isEmpty().trim(),
    check("available", "available field must be a boolean and cannot be empty")
      .isBoolean()
      .not()
      .isEmpty(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.send({ error: errors.array() });
    } else {
      await Show.create({
        title: request.body.title,
        genre: request.body.genre,
        rating: null,
        available: request.body.available,
      });

      const show = await Show.findAll();
      response.send(show);
    }
  }
);

//DELETE
router.delete("/:id", async (request, response) => {
  await Show.destroy({
    where: {
      id: request.params.id,
    },
  });
  console.log("Item deleted");
  response.send(await Show.findAll());
});

// TODO
// Implement update post validation (to have optional fields)
// Try to add validation where not only science Fiction passes but science fiction passes
// Remove custom validators that have async and dont need it

module.exports = router;
