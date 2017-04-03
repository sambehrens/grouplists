var database = firebase.database();
var count = 0;
var itemCount = 0;
var listNum = sessionStorage.getItem('num');
var ready = false;
var name;
var description;
var deleted = null;

$(document).ready(function() {
    var titleRef = database.ref('lists/' + listNum + '/');
    titleRef.on('value', function(snapshot) {
        $("#listTitle").text(snapshot.val().listName + "'s List")
        $("#listDescription").text(snapshot.val().description);
        name = snapshot.val().listName;
        description = snapshot.val().description;
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
            $("#listBody").append("<tr id='" + index + "'><td id=rank" + index + "><p class='help-block' id='rankP" + index + "'>" + snapshot.val().rank + "</p></td><td id=name" + index + "><h5 id='nameP" + index + "'>" + snapshot.val().itemName + "</h5></td><td id='description" + index + "'><p class='help-block' id='descriptionP" + index + "'>" + snapshot.val().description + "</p></td>" + snapshot.val().link + "<td class='hidden-print'><button name='" + index + "' type='button' class='btn btn-default editButton'>Edit</button></td><td class='hidden-print'><button type='button' name='" + index + "' class='close deleteButton' aria-label='Close'><span aria-hidden='true'>&times;</span></button></td></tr>");
        }
    });
}
function clearList() {
    database.ref('lists/' + listNum + '/itemCount').set(0);
    database.ref('lists/' + listNum + '/listItems').remove();
    deleted = 0;
    itemCount = 0;
}

$("#addButton").click(function() {
    var rank = $("#inputGiftRank").val();
    var name = $("#inputGiftName").val();
    var description = $("#inputGiftDescription").val();
    var link = $("#inputGiftLink").val();
    var linkButton = '<td class="hidden-print"><a type="button" id="linkButton" class="btn btn-info" href=' + link + ' target="_blank">See it online</a></td>';
    if (name === "") {
        alert("Please enter a name for the item");
    }
    if (link === "") {
        linkButton = '<td class="hidden-print"><button type="button" id="linkButton" class="btn btn-default" disabled="disabled">No link</button></td>';
    }
    if (name !== "") {
        $("#listBody").append("<tr id='" + itemCount + "'><td id='rank" + itemCount + "'><p class='help-block' id='rankP" + itemCount + "'>" + rank + "</p></td><td id='name" + itemCount + "'><h5 id='nameP" + itemCount + "'>" + name + "</h5></td><td id='description" + itemCount + "'><p class='help-block' id='descriptionP" + itemCount + "'>" + description + "</p></td>" + linkButton + "<td class='hidden-print' id='edit" + itemCount + "'><button name='" + itemCount + "' type='button' class='btn btn-default editButton'>Edit</button></td><td class='hidden-print'><button type='button' name='" + itemCount + "' class='close deleteButton' aria-label='Close'><span aria-hidden='true'>&times;</span></button></td></tr>");
        $("#inputGiftRank").val("");
        $("#inputGiftName").val("");
        $("#inputGiftDescription").val("");
        $("#inputGiftLink").val("");
        writeListData(name, description, linkButton, rank);
        itemCount++;
        database.ref('lists/' + listNum + '/itemCount').set(itemCount);
    }
    window.location.href = '#add';
});
$(document).on('click', '.deleteButton', function() {
    $("#" + $(this).attr('name')).remove();
    var deletedRef = database.ref('lists/' + listNum + '/listItems/item' + $(this).attr('name') + '/deleted').set(true);
    deleted += 1;
    if (deleted === itemCount) {
        clearList();
    }
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
            $("#rank" + clicked).html("<p class='help-block' id='rankP" + clicked + "'>" + tempRank + "</p>");
            var rankRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/rank').set(tempRank);
            // done for the name
            $("#name" + clicked).html("<h5 id='nameP" + clicked + "'>" + tempName + "</h5>");
            var nameRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/itemName').set(tempName);
            // done for the description
            var tempDescription = $("#inputNewDescription" + clicked).val();
            $("#description" + clicked).html("<p class='help-block' id='descriptionP" + clicked + "'>" + tempDescription + "</p>");
            var descriptionRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/description').set(tempDescription);
        }
    }
});
$(document).on('click', '#backButton', function() {
    window.location.href = '../index.html';
});
$(document).on('click', '#editListName', function() {
    $(this).remove();
    $('#functionRow').append('<form class="form-inline" id="enterListNameForm"><div class="form-group"><label class="sr-only" for="name">Name</label><input type="normal" class="form-control" id="inputListName" placeholder="List Name"></div><button id="submitNewName" type="button" class="btn btn-default submitButton" style="margin-left: 4.5%;"><span class="glyphicon glyphicon-check"></span> Done</button></form>');
    if (name != "") {
        $('#inputListName').val(name);
    }
});
$(document).on('click', '#submitNewName', function() {
    var tempListName = $('#inputListName').val();
    if (tempListName != "") {
        database.ref('lists/' + listNum + '/listName').set(tempListName);
        $('#enterListNameForm').remove();
        $('#functionRow').append('<button type="button" id="editListName" class="btn btn-default"><span class="glyphicon glyphicon-edit"></span> Edit List Name</button>');
    }
});
$(document).on('click', '#editListDescription', function() {
    $(this).remove();
    if ($('#editListName').length) {
        $('#editListName').remove();
        $('#functionRow').append('<form class="form-inline" id="enterListDescriptionForm"><div class="form-group"><label class="sr-only" for="name">Description</label><input type="normal" class="form-control" id="inputListDescription" placeholder="List Description"></div><button id="submitNewDescription" type="button" class="btn btn-default submitButton" style="margin-left: 4.5%;"><span class="glyphicon glyphicon-check"></span> Done</button></form><button type="button" id="editListName" class="btn btn-default"><span class="glyphicon glyphicon-edit"></span> Edit List Name</button>');
    }
    else {
        $('#enterListNameForm').remove();
        $('#functionRow').append('<form class="form-inline" id="enterListDescriptionForm"><div class="form-group"><label class="sr-only" for="name">Description</label><input type="normal" class="form-control" id="inputListDescription" placeholder="List Description"></div><button id="submitNewDescription" type="button" class="btn btn-default submitButton" style="margin-left: 4.5%;"><span class="glyphicon glyphicon-check"></span> Done</button></form><form class="form-inline" id="enterListNameForm"><div class="form-group"><label class="sr-only" for="name">Name</label><input type="normal" class="form-control" id="inputListName" placeholder="List Name"></div><button id="submitNewName" type="button" class="btn btn-default submitButton" style="margin-left: 4.5%;"><span class="glyphicon glyphicon-check"></span> Done</button></form>');
        if (name != "") {
            $('#inputListName').val(name);
        }
    }
    if (description != "") {
        $('#inputListDescription').val(description);
    }
});
$(document).on('click', '#submitNewDescription', function() {
    var tempListDesc = $('#inputListDescription').val();
    if (tempListDesc != "") {
        database.ref('lists/' + listNum + '/description').set(tempListDesc);
        $('#enterListDescriptionForm').remove();
        if ($('#editListName').length) {
            $('#editListName').remove();
            $('#functionRow').append('<button type="button" id="editListDescription" class="btn btn-default"><span class="glyphicon glyphicon-edit"></span> Edit List Description</button><button type="button" id="editListName" class="btn btn-default"><span class="glyphicon glyphicon-edit"></span> Edit List Name</button>');
        }
        else {
            $('#enterListNameForm').remove();
            $('#functionRow').append('<button type="button" id="editListDescription" class="btn btn-default"><span class="glyphicon glyphicon-edit"></span> Edit List Description</button><form class="form-inline" id="enterListNameForm"><div class="form-group"><label class="sr-only" for="name">Name</label><input type="normal" class="form-control" id="inputListName" placeholder="List Name"></div><button id="submitNewName" type="button" class="btn btn-default submitButton" style="margin-left: 4.5%;"><span class="glyphicon glyphicon-check"></span> Done</button></form>');
            if (name != "") {
                $('#inputListName').val(name);
            }
        }
    }
});
$(document).on('click', '#printListButton', function() {
    window.print();
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