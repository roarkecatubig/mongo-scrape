// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {

  // Grabs the notes from a clicked article 
  function getNotes(id) {
    $("#all_notes").empty();
    $.ajax({
      method: "GET",
      url: "/articles/" + id
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);


        // If there's a note in the article
        if (data.note) {
          console.log(data.note)
          console.log(data.note.length)
          console.log(data.note.title);
          console.log(data.note.body)
          for (i=0; i < data.note.length; i++) {
            var noteTable = $("<table>");
            noteTable.addClass("table");
            noteTable.attr("article-id", id);

            var tableHead = $("<thead>");
            tableHeadRow = $("<tr>");

            var tableTitle = $("<th>");
            tableTitle.attr("scope", "col");
            tableTitle.text(data.note[i].title);

            var tableBody = $("<tbody>");

            var tableBodyRow = $("<tr>");

            var tableText = $("<td>");
            tableText.text(data.note[i].body);

            var deleteButton = $("<button>")
            deleteButton.attr("type", "button");
            deleteButton.attr("data-id", data.note[i]._id);
            deleteButton.addClass("btn btn-danger delete_button");
            deleteButton.text("Delete")

            tableHeadRow.append(tableTitle);
            tableHead.append(tableHeadRow);

            tableBodyRow.append(tableText);
            tableBodyRow.append(deleteButton);
            tableBody.append(tableBodyRow);

            noteTable.append(tableHead);
            noteTable.append(tableBody);

            $("#all_notes").append(noteTable)
          }

        }
      });

    $(".modal-title").text("Notes for " + id)
    $(".submit_note").attr("data-id", id)
  }

// Event handler that checks for a "View Comments" button to be clicked and then renders the notes for the appropriate article by grabbing the data-id attribute, which is the article ObjectID
  $(document).on("click", ".view_comments", function() {
    var article_id = $(this).parent().attr("data-id");
    getNotes(article_id)
  })

// Event handler that deletes the note reference in the article's notes array
  $(document).on("click", ".delete_button", function () {
    var noteId = $(this).attr("data-id");
    var article_id = $(this).parent().parent().parent().attr("article-id");

    $.ajax({
      method: "PUT",
      url: "/delete/" + article_id + "/" + noteId

    })

    .then(function(data) {
      console.log("Note deleted from article array")
      // Deletes the note itself
      $.ajax({
        method: "POST",
        url: "/notes/delete/" + noteId
      }).then(function(new_data) {
        console.log("note deleted from notes collection")
        getNotes(article_id)
      });
    })
    

  })

  // Handles the "Submit Note" event handler to post the note to the db and saves the reference to the appropriate article
  $(document).on("click", ".submit_note", function() {
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
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#titleinput").val("");
        $("#bodyinput").val("");
        getNotes(thisId)
      });

  });

// Event handler that removes an article from the list 
  $(document).on("click", ".remove_article", function() {
    var article_id = $(this).parent().attr("data-id");
    $.ajax({
      method: "POST",
      url: "/article/delete/" + article_id
    })
    .then(function(new_data) {
      console.log("note deleted from notes collection")
      location.reload()
    });
  });

  // Scrapes the NY Times website for news articles
  $(document).on("click", ".scrape_articles", function() {
    $.ajax({
      method: "GET",
      url: "/scrape" 
    })
    .then(function(data) {
      console.log("New articles scraped");
      location.reload();
    })
  });

  // Deletes all of the articles saved to the db. Clears the page fully. 
  $(document).on("click", ".clear_articles", function() {
    $.ajax({
      method: "POST",
      url: "/articles/delete/all" 
    })
    .then(function(data) {
      console.log("All articles deleted");
      location.reload();
    })
  });

});
  