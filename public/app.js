$(function () {
  // Grab the articles as a json
  $.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      console.log(data[i].link);
      console.log(data[i].image);
      console.log(data[i].title);
      console.log(data[i]._id);
      
      var cardImg = $('<div class="card">').append($('<a href="' + data[i].link + '" target="_blank"><img src="' + data[i].image + '" class = "card-img-top"></a>'));
      var card = $('<div class="card-body">').append($('<h5 class="card-title">' + data[i].title + '</h5><footer class="blockquote-footer"><small class="text-muted">' + data[i].author + ' <cite title="Source Title">' + data[i].category + '</cite></small><button class="note-button" type="button" class="btn btn-secondary btn-sm" data-toggle="modal" data-target="#exampleModal" data-id="' + data[i]._id + '">Notes</button></footer>'));
      $(cardImg).append(card);
      $(".card-columns").append(cardImg);
    }
  });

  $(document).on("click", "#scrape", function () {
    $.ajax({
      method: "GET",
      url: "/scrape"
    })
      .then(function (data) {
        console.log(data);
        location.reload();
      })
  })

  $(document).on("click", "#clear", function () {
    $.ajax({
      method: "GET",
      url: "/clear"
    })
      .then(function (data) {
        console.log(data);
        $(".card-columns").empty();

      })
  })

  // Whenever someone clicks a p tag
  $(document).on("click", ".note-button", function () {
    // Empty the notes from the note section
    // $(".card-columns").empty();
    // $("#titleinput").empty();
    // $("#bodyinput").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function (data) {
        console.log(data);
        console.log(data._id);
        if (data.note === undefined) {
          data.note = '';
          data.title = '';
        }
        console.log(data.note);
        
        
        // The title of the article
        $(".savenote").attr("data-id", data._id);
        // // An input to enter a new title
        // $("#notes").append("<input id='titleinput' name='title' >");
        // // A textarea to add a new note body
        // $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // // A button to submit a new note, with the id of the article saved to it
        // $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        // if (!data.note) {
        //   $("#titleinput").empty();
        //   $("#bodyinput").empty();
        // }

        // If there's a note in the article
        // if (data.note === undefined) {
        //   $("#titleinput").empty();
        //   $("#bodyinput").empty();
        // } else {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
          
        // }
      });
  });

  // When you click the savenote button
  $(document).on("click", ".savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        alert("Note Saved")
        // $(".card-columns").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    // $("#titleinput").val("");
    // $("#bodyinput").val("");
  });

});