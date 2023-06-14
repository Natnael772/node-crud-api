const express = require("express");
const app = express();

const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());

//cors middleware for allowing cross site resource sharing
app.use(cors());

let persons = [
  {
    id: "1",
    name: "Sam",
    age: "26",
    hobbies: [],
  },
]; //This is your in memory database

app.set("db", persons);

//TODO: Implement crud of person

//create person
app.post("/person", (req, res) => {
  const { name, age, hobbies } = req.body;

  if (!name || !age || !hobbies) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide name, age and hobbies",
    });
  }

  const personSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required(),
    hobbies: Joi.array().items(Joi.string()).required(),
  });

  const { error } = personSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "fail", messaage: error.details[0].message });
  }

  const id = uuidv4();
  const newPerson = { id: id, ...req.body };
  persons.push(newPerson);

  return res.status(200).json({ status: "success", person: newPerson });
});

//get all persons
app.get("/person", (req, res) => {
  return res.status(200).json(persons);
});

//get person with id
app.get("/person/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((p) => id === p.id);

  if (!person) {
    return res
      .status(404)
      .json({ status: "fail", message: "No person with this id" });
  }

  return res.status(200).json(person);
});

//update person
app.put("/person/:id", (req, res) => {
  const id = req.params.id;
  const updatedPerson = req.body;
  const index = persons.findIndex((p) => id === p.id);

  if (index === -1) {
    return res.status(404).json({
      status: "fail",
      message: "No person is found with this id",
    });
  }

  persons[index] = { ...persons[index], ...updatedPerson };
  return res.status(201).json({ status: "success", person: persons[index] });
});

//delete person
app.delete("/person/:id", (req, res) => {
  const id = req.params.id;
  const personIndex = persons.findIndex((p) => id === p.id);

  if (personIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: "No person with this id",
    });
  }

  persons.splice(personIndex, 1);

  return res.status(200).json({
    status: "success",
    message: "Person deleted successfully",
  });
});

//handling requests to non-existing endpoints
app.use((req, res) => {
  return res.status(404).json({
    status: "fail",
    message: "Endpoint does not exist",
  });
});

//internal server error
app.use((err, req, res, next) => {
  return res
    .status(500)
    .json({ status: "fail", message: "Something went wrong" });
});

if (require.main === module) {
  app.listen(3000);
}
module.exports = app;
