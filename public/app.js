$(function () {
  // Grab the articles as a json
  $.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
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
      });
  });

  $(document).on("click", "#clear", function () {
    $.ajax({
      method: "GET",
      url: "/clear"
    })
      .then(function (data) {
        console.log(data);
        $(".card-columns").empty();
      });
  });

  // Whenever someone clicks a note button
  $(document).on("click", ".note-button", function () {
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function (data) {
        if (data.note === undefined) {
          data.note = '';
          data.title = '';
        };

        // Apply the id to the modal
        $(".savenote").attr("data-id", data._id);

        // Place the title and body of the note in the input
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
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
        alert("Note Saved")
      });
  });
});