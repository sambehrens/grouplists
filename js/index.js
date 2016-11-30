var database = firebase.database();
var count = null;
var ready = false;

$(document).ready(function() {
    var countRef = database.ref('/count');
    countRef.on('value', function(snapshot) {
        count = snapshot.val();
        ready = true;
        if (count === null) {
            count = 0;
        }
    });
    loadData();
});

function loadData() {
    if (ready) {
        for (var i = 0; i < count; i+=1) {
            var listRef = database.ref('lists/list' + i);
            appendList(listRef, i);
        }
    }
    else {
        setTimeout(loadData, 50);
    }
}

function appendList(listRef,index) {
    listRef.on('value', function(snapshot) {
        $("#listBody").append("<tr><td>" + snapshot.val().listName + "</td><td><p class='help-block'>" + snapshot.val().description + "</p></td><td><button name='list" + index + "' type='button' class='btn btn-info viewButton'>View it</button></td><td><button name='list" + index + "' type='button' class='btn btn-primary editButton'>Edit it</button></td></tr>");
    });
}

$("#addButton").click(function() {
    var name = $("#inputListName").val();
    var description = $("#inputListDescription").val();
    var password = $("#inputListPassword").val();
    var viewButton = '<td><button name="list' + count + '" type="button" class="btn btn-info viewButton">View it</button></td>';
    var editButton = '<td><button name="list' + count + '" type="button" class="btn btn-primary editButton">Edit it</button></td>';
    if (name === "") {
        alert("Please enter your name for the list");
    }
    if (password === "") {
        alert("Please enter a password for the list");
    }
    if (description === "") {
        description = "None given...";
    }
    if (name !== "" && password !== "") {
        $("#listBody").append("<tr><td>" + name + "</td><td><p class='help-block'>" + description + "</p></td>" + viewButton + editButton + "</tr>");
        $("#inputListName").val("");
        $("#inputListDescription").val("");
        $("#inputListPassword").val("");
        writeListData(name, description, password);
        count++;
        database.ref('count').set(count);
    }
});
$(document).on('click', '.editButton', function() {
    var index = $(this).attr('name');
    sessionStorage.setItem('num', index);
    window.location.href = 'user.html';
});
$(document).on('click', '.viewButton', function() {
    var index = $(this).attr('name');
    sessionStorage.setItem('num', index);
    window.location.href = 'guest.html';
});

function writeListData(name, description, password) {
  database.ref('lists/list' + count).set({
      listName: name,
      description: description,
      password: password,
      itemCount: 0
  });
}