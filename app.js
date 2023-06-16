// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

// Calling and using requirements
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://0.0.0.0:27017/usersDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Successfully"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Initial variables
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Bonjour Folks! I am an aspiring Developer who loves to work with technologies and always enthu about new one.If our paths match do connect with me through Email";

// Mongoose Schemas
const userInputSchema = new mongoose.Schema({
  inputTitle: String,
  inputTitleKebab: String,
  inputText: String
});

const postTitleSchema = new mongoose.Schema({
  givenTitle: String
});

// Mongoose models
const Input = mongoose.model("Input", userInputSchema);
const Title = mongoose.model("Title", postTitleSchema);

// Home route
app.get("/", async function (req, res) {
  try {

    const results = await Input.find({}).exec();
    const userInputs = results.length === 0 ? [{ inputTitle: "", inputText: "" }] : results;
    res.render("home", { firstParagraph: homeStartingContent, userInputs: userInputs });

  } catch(err) {

    console.error("Error retrieving inputs:", err);
    res.status(500).send("Internal Server Error");
  }
  
});

// Contact route
app.get("/contact", function (req, res) {
  res.render("contact", { contactParagraph: contactContent });
});

// About route
app.get("/about", function (req, res) {
  res.render("about", { aboutParagraph: aboutContent });
});

// Compose route and post
app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Input({
    inputTitle: _.startCase(req.body.userTitle),
    inputTitleKebab: _.kebabCase(req.body.userTitle),
    inputText: req.body.userText
  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error("Error saving post:", err);
      res.status(500).send("Internal Server Error");
    });
});

// User parameter input in the URL box
app.get("/posts/:parameterInput", async function (req, res) {
  try {
    const parameterInput = req.params.parameterInput;
    const result = await Input.exists({ inputTitleKebab: _.kebabCase(parameterInput) });
    
    if (result) {
      const postTitle = _.startCase(_.capitalize(parameterInput));
      const results = await Input.find({ inputTitleKebab: _.kebabCase(parameterInput) }).exec();
      const postText = results.map(element => element.inputText);
      res.render("post", { postTitle: postTitle, postText: postText });
    } else {
      res.render("post", { postTitle: "Post not found...", postText: "" });
    }
  } catch (err) {
    console.error("Error retrieving post:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
