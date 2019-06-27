var express = require("express");
var exphbs = require('express-handlebars');
var logger = require("morgan");
var mongoose = require("mongoose");

// Require all models
var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

app.get('/', function (req, res) {
  res.render('home');
});

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.orlandoweekly.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.latestTsr").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children()
        .children("h3")
        .text();
      result.link = $(this)
        .children()
        .children("a")
        .attr("href");
      result.image = $(this)
        .children()
        .children("a")
        .children("img")
        .attr("src");
      result.author = $(this)
        .children()
        .children(".byline")
        .text();
      result.category = $(this)
        .children()
        .children("h4")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for clearing all Articles from the db
app.get("/clear", function (req, res) {
  db.Article.remove({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,

  db.Article.findById(req.params.id)
    // and run the populate method with "note",
    .populate("note")
    // then responds with the article with the note included
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  db.Note.create(req.body)
    .then(function (dbNote) {
      // then find an article from the req.params.id
      return db.Article.findByIdAndUpdate(req.params.id,
        // and update it's "note" property with the _id of the new note
        { note: dbNote.id });
    })
    .then(function (dbArticle) {
      // If the User was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});