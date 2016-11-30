var database = firebase.database();
var count = 0;
var itemCount = 0;
var listNum = sessionStorage.getItem('num');
var ready = false;

$(document).ready(function() {
    var titleRef = database.ref('lists/' + listNum + '/');
    titleRef.on('value', function(snapshot) {
        $("#listTitle").text(snapshot.val().listName + "'s List")
    });
    var countRef = database.ref('lists/' + listNum + '/itemCount');
    countRef.on('value', function(snapshot) {
        itemCount = snapshot.val();
        ready = true;
        if (itemCount === null) {
            itemCount = 0;
        }
    });
    loadData();
});

function loadData() {
    if (ready) {
        for (var i = 0; i < itemCount; i+=1) {
            var listRef = database.ref('lists/' + listNum + '/listItems/item' + i + '/');
            appendList(listRef, i);
        }
    }
    else {
        setTimeout(loadData, 50);
    }
}
function appendList(listRef,index) {
    listRef.once('value').then(function(snapshot) {
        if (!snapshot.val().deleted) {
            $("#listBody").append("<tr id='" + index + "'><td id=rank" + index + "><p class='help-block' id='rankP" + index + "'>" + snapshot.val().rank + "</p></td><td id=name" + index + "><h5 id='nameP" + index + "'>" + snapshot.val().itemName + "</h5></td><td id='description" + index + "'><p class='help-block' id='descriptionP" + index + "'>" + snapshot.val().description + "</p></td>" + snapshot.val().link + "<td><button name='" + index + "' type='button' class='btn btn-default editButton'>Edit</button></td><td><button type='button' name='" + index + "' class='close deleteButton' aria-label='Close'><span aria-hidden='true'>&times;</span></button></td></tr>");
        }
    });
}

$("#addButton").click(function() {
    var rank = $("#inputGiftRank").val();
    var name = $("#inputGiftName").val();
    var description = $("#inputGiftDescription").val();
    var link = $("#inputGiftLink").val();
    var linkButton = '<td><a type="button" id="linkButton" class="btn btn-info" href=' + link + ' target="_blank">See it online</a></td>';
    if (rank === "") {
        rank = "-";
    }
    if (name === "") {
        alert("Please enter a name for the item");
    }
    if (description === "") {
        description = "None given...";
    }
    if (link === "") {
        linkButton = '<td><button type="button" id="linkButton" class="btn btn-default" disabled="disabled">No link</button></td>';
    }
    if (name !== "") {
        $("#listBody").append("<tr id='" + itemCount + "'><td id='rank" + itemCount + "'><p class='help-block' id='rankP" + itemCount + "'>" + rank + "</p></td><td id='name" + itemCount + "'><h5 id='nameP" + itemCount + "'>" + name + "</h5></td><td id='description" + itemCount + "'><p class='help-block' id='descriptionP" + itemCount + "'>" + description + "</p></td>" + linkButton + "<td id=edit" + itemCount + "><button name='" + itemCount + "' type='button' class='btn btn-default editButton'>Edit</button></td><td><button type='button' name='" + itemCount + "' class='close deleteButton' aria-label='Close'><span aria-hidden='true'>&times;</span></button></td></tr>");
        $("#inputGiftRank").val("");
        $("#inputGiftName").val("");
        $("#inputGiftDescription").val("");
        $("#inputGiftLink").val("");
        writeListData(name, description, linkButton, rank);
        itemCount++;
        database.ref('lists/' + listNum + '/itemCount').set(itemCount);
    }
});
$(document).on('click', '.deleteButton', function() {
    $("#" + $(this).attr('name')).remove();
    var deletedRef = database.ref('lists/' + listNum + '/listItems/item' + $(this).attr('name') + '/deleted').set(true);
});
$(document).on('click', '.editButton', function() {
    var clicked = $(this).attr('name');
    if ($(this).html() === 'Edit') {
        $(this).html("Done");
        // this is the rank edit
        var tempRank = $("#rankP" + clicked).html();
        $("#rank" + clicked).html("");
        $("#rank" + clicked).append('<form class="form-inline"><div class="form-group"><label class="sr-only" for="inputNewRank">Rank</label><input type="normal" class="form-control" id="inputNewRank' + clicked + '" placeholder="Rank"></div></form>');
        $("#inputNewRank" + clicked).val(tempRank);
        // this is the name edit
        var tempName = $("#nameP" + clicked).html();
        $("#name" + clicked).html("");
        $("#name" + clicked).append('<form class="form-inline"><div class="form-group"><label class="sr-only" for="inputNewName">Name</label><input type="normal" class="form-control" id="inputNewName' + clicked + '" placeholder="Name"></div></form>');
        $("#inputNewName" + clicked).val(tempName);
        // this is the description edit
        var tempDescription = $("#descriptionP" + clicked).html();
        $("#description" + clicked).html("");
        $("#description" + clicked).append('<form class="form-inline"><div class="form-group"><label class="sr-only" for="inputNewDescription">Description</label><input type="normal" class="form-control" id="inputNewDescription' + clicked + '" placeholder="Description"></div></form>');
        $("#inputNewDescription" + clicked).val(tempDescription);
    }
    else if ($(this).html() === 'Done') {
        var tempName = $("#inputNewName" + clicked).val();
        if (tempName === "") {
            alert("Please enter a name for the item");
        }
        else {
            $(this).html("Edit");
            // done for the rank
            var tempRank = $("#inputNewRank" + clicked).val();
            if (tempRank === "") {
                tempRank = "-";
            }
            $("#rank" + clicked).html("<p class='help-block' id='rankP" + clicked + "'>" + tempRank + "</p>");
            var rankRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/rank').set(tempRank);
            // done for the name
            $("#name" + clicked).html("<h5 id='nameP" + clicked + "'>" + tempName + "</h5>");
            var nameRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/itemName').set(tempName);
            // done for the description
            var tempDescription = $("#inputNewDescription" + clicked).val();
            if (tempDescription === "") {
                tempDescription = "None given...";
            }
            $("#description" + clicked).html("<p class='help-block' id='descriptionP" + clicked + "'>" + tempDescription + "</p>");
            var descriptionRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/description').set(tempDescription);
        }
    }
});

function writeListData(name, description, link, rank) {
  database.ref('lists/' + listNum + '/listItems/item' + itemCount + '/').set({
      itemName: name,
      description: description,
      link: link,
      rank: rank,
      claimed: false,
      claimer: "unknown",
      deleted: false
  });
}