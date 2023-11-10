const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.use(express.json());

//GET /
router.get("/", async (request, response) => {
  const show = await Show.findAll();
  response.send(show);
});

// GET /:id
router.get("/:id", async (request, response) => {
  const id = request.params.id;
  const show = await Show.findByPk(id);
  response.send(show);
});

//GET shows of a particular genre for example, /shows/genres/Comedy.
router.get("/genres/:genrePick", async (request, response) => {
  const genre = request.params.genrePick;
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
  response.send(`Here are the shows with the genre ${genre}: ${arrOfShows}`);
});

//GET to show all users who watched this show
router.get("/:id/users", async (request, response) => {
  const id = request.params.id;

  const showUsers = await Show.findOne({
    where: {
      id: id,
    },
    include: User,
  });

  if (showUsers == null) {
    response.send(`ERROR No user with id:${id}  found!!`);
  } else if (showUsers.users == null) {
    response.send(`0 users have watched ${showUsers.title}`);
  } else {
    const arrOfUsers = [];
    for (let userWatched of showUsers.users) {
      arrOfUsers.push(userWatched.username);
    }
    response.send(
      `"${showUsers.title}" has been watched by the users: ${arrOfUsers}`
    );
  }
});
//PUT
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
      .isInt({ min: 0, max: 100 })
      .not()
      .isEmpty(),
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
      await Show.update(
        {
          title: request.body.title,
          genre: request.body.genre,
          rating: request.body.rating,
          available: request.body.available,
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      const thisShow = await Show.findByPk(request.params.id);
      response.send({
        title: thisShow.title,
        genre: thisShow.genre,
        rating: thisShow.rating,
        available: thisShow.available,
      });
    }
  }
);

//PUT update the rating of a show.
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

//TODO

// DONE

module.exports = router;
