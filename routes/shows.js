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
      "title field must be between 5 and 25 characters long and cannot be empty"
    )
      .isLength({ min: 5, max: 25 })
      .not()
      .isEmpty(),
    check("genre", "genre cannot be empty ").not().isEmpty(),
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
// PUT (endpoint /shows/3/updates/key) (i added the key part so if you want to update the "available" property key would be /shows/3/updates/avaliable)
// Good idea but i scrapped it

// POST
router.post("/", async (request, response) => {
  await Show.create({
    title: request.body.title,
    genre: request.body.genre,
    rating: request.body.rating,
    available: request.body.available,
  });

  const show = await Show.findAll();
  response.send(show);
});

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

// POST Create a show (show "title" must have a minimum of 5 characters and a maximum of 25 characters )

// DONE

// PUT avaliable (must be a boolean)
// PUT rating (must be a number)
// PUT (endpoint /shows/3/updates/[thing to update]) (i added this part so if you want to update the "available" property key would be /shows/3/updates/avaliable)
//    update the title of a show (a show
//    update the "available" property OR "status" of a show
//    For example, a PUT request with the endpoint /shows/3/updates should be able to update the 3rd shows available to “true” or “false.
//    If theres a request to update the "available" property of a show, the "available" property field cannot be empty or contain whitespace and must be Boolean.
//    The "available" property must be a minimum of 5 characters and a maximum of 25 characters
// GET shows of a particular genre (genre in req.query)
//      For example, /shows/genres/Comedy should return all shows with a genre of Comedy.
// GET all users who watched a show
// GET all shows DONE
// GET one show DONE
// DELETE a show DONE
// PUT The Show Router should update a rating on a specific show using an endpoint.
//      For example, a PUT request to /shows/4/watched (through table is called watched) would update the 4th show that has been watched.
//      the “rating” field cannot be empty or contain whitespace.
module.exports = router;
