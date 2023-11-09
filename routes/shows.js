const express = require("express");
const { Show, User } = require("../models/index.js");
const router = express.Router();

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

//PUT
router.put("/:id", async (request, response) => {
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
  response.send(thisShow);
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

// GET all users who watched a show

// GET shows of a particular genre (genre in req.query)
//      For example, /shows/genres/Comedy should return all shows with a genre of Comedy.

// GET all users who watched a show

// PUT
//    update the title of a show
//    update the "available" property OR "status" of a show
//    For example, a PUT request with the endpoint /shows/3/updates should be able to update the 3rd shows available to “true” or “false.
//    If theres a request to update the "available" property of a show, the "available" property field cannot be empty or contain whitespace and must be Boolean.
//    The "available" property must be a minimum of 5 characters and a maximum of 25 characters

// PUT The Show Router should update a rating on a specific show using an endpoint.
//      For example, a PUT request to /shows/4/watched (through table is called watched) would update the 4th show that has been watched.
//      the “rating” field cannot be empty or contain whitespace.

// POST Create a show (show "title" must have a minimum of 5 characters and a maximum of 25 characters )

// DONE

// GET all shows DONE
// GET one show DONE
// DELETE a show DONE
module.exports = router;
