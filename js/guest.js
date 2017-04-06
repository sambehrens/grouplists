var database = firebase.database();
var count = 0;
var itemCount = 0;
var listNum = sessionStorage.getItem('num');
var ready = false;

$(document).ready(function() {
    var titleRef = database.ref('lists/' + listNum + '/');
    titleRef.on('value', function(snapshot) {
        $("#listTitle").text(snapshot.val().listName + "'s List")
        $("#listDescription").text(snapshot.val().description);
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
            listRef.on('value', function(snapshot) {
                if (!snapshot.val().deleted) {
                    if (!snapshot.val().claimed) {
                        $("#listBody").append("<tr id='" + snapshot.val().itemName.replace(/\s/g, '') + "'><td><p class='help-block'>" + snapshot.val().rank + "</p></td><td><h5>" + snapshot.val().itemName + "</h5></td><td><p class='help-block'>" + snapshot.val().description + "</p></td>" + snapshot.val().link + "<td class='hidden-print' id='" + i + "'><button name='" + i + "' type='button' class='btn btn-primary get-it'>I'll get it</button></td></tr>");
                    }
                    else {
                        $("#listBody").append("<tr id='" + snapshot.val().itemName.replace(/\s/g, '') + "'><td><p class='help-block'>" + snapshot.val().rank + "</p></td><td><p class='help-block'>" + snapshot.val().itemName + "</p></td><td><p class='help-block'>" + snapshot.val().description + "</p></td>" + snapshot.val().link + "<td><p class='text-danger'>" + snapshot.val().claimer + "</p></td></tr>");
                    }
                }
            });
        }
    }
    else {
        setTimeout(loadData, 50);
    }
}

$(document).on('click', '.get-it', function() {
    var clicked = $(this).attr('name');
    $(this).remove();
    $enterNameForm = $('<form class="form-inline claimItForm"  id="enterNameForm' + clicked + '" hidden=true><div class="form-group"><label class="sr-only" for="exampleInputEmail3">Email address</label><input type="normal" class="form-control" id="inputYourName' + clicked + '" placeholder="Your Name"></div><button name="' + clicked + '" type="button" style="margin-left: 6px;" class="btn btn-default submitButton">Submit</button></form>');
    ($enterNameForm).appendTo('#' + clicked).show('fast');
});
$(document).on('click', '.submitButton', function() {
    var clicked = $(this).attr('name');
    if ($('#inputYourName' + clicked + '').val() !== "") {
        var claimedRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/claimed').set(true);
        var claimerRef = database.ref('lists/' + listNum + '/listItems/item' + clicked + '/claimer').set($('#inputYourName' + clicked + '').val());
        location.reload();
    }
    else {
        $('#' + clicked).empty();
        $('#' + clicked).append("<button name='" + clicked + "' type='button' class='btn btn-primary get-it'>I'll get it</button>");
    }
});
$(document).on('click', '#backButton', function() {
    window.location.href = '../index.html';
});
$(document).on('click', '.printListButton', function() {
    window.print();
});