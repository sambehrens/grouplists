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
        if (!snapshot.val().deleted) {
            $("#listBody").append("<tr><td><h5>" + snapshot.val().listName + "</h5></td><td><p class='help-block'>" + snapshot.val().description + "</p></td><td><button name='list" + index + "' type='button' class='btn btn-info viewButton'>View it</button></td><td><button name='list" + index + "' type='button' class='btn btn-primary editButton'>Edit it</button></td></tr>");
        }
    });
}
$(document).on('click', '#addButton', function() {
    var name = $("#inputListName").val();
    var description = $("#inputListDescription").val();
    var password = $("#inputListPassword").val();
    var viewButton = '<td><button name="list' + count + '" type="button" class="btn btn-info viewButton">View it</button></td>';
    var editButton = '<td><button name="list' + count + '" type="button" class="btn btn-primary editButton">Edit it</button></td>';
    if (name === "") {
        $('#alertBar').html('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span>Enter a valid list name');
        $('#alertBar').fadeIn('fast');
    }
    else if (password === "") {
        $('#alertBar').html('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span>Enter a valid password');
        $('#alertBar').fadeIn('fast');
    }
    if (description === "") {
        description = "";
    }
    if (name !== "" && password !== "") {
        $("#listBody").append("<tr><td><h5>" + name + "</h5></td><td><p class='help-block'>" + description + "</p></td>" + viewButton + editButton + "</tr>");
        $("#inputListName").val("");
        $("#inputListDescription").val("");
        $("#inputListPassword").val("");
        writeListData(name, description, password);
        count++;
        database.ref('count').set(count);
        $('#alertBar').hide();
    }
});
$(document).on('click', '.editButton', function() {
    var index = $(this).attr('name');
    sessionStorage.setItem('num', index);
    window.location.href = 'html/user.html';
});
$(document).on('click', '.viewButton', function() {
    var index = $(this).attr('name');
    sessionStorage.setItem('num', index);
    var username = "";
    var nameRef = database.ref('lists/' + index + '/');
    nameRef.on('value', function(snapshot) {
        username = snapshot.val().listName;
    });
    BootstrapDialog.confirm({
        title: 'WARNING',
        message: 'You will see who is getting what gifts for ' + username + '! Are you sure you want to proceed?',
        type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
        closable: true, // <-- Default value is false
        btnOKLabel: 'Yes!', // <-- Default value is 'OK',
        btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
        callback: function(result) {
            // result will be true if button was click, while it will be false if users close the dialog directly.
            if(result) {
                window.location.href = 'html/guest.html';
            }else {
                // do nothing
            }
        }
    });
});

function writeListData(name, description, password) {
  database.ref('lists/list' + count).set({
      listName: name,
      description: description,
      password: password,
      itemCount: 0,
      deleted: false
  });
}

// bootstrap modal
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DEFAULT] = 'Information';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_INFO] = 'Information';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_PRIMARY] = 'Information';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_SUCCESS] = 'Success';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_WARNING] = 'Warning';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DANGER] = 'Danger';
BootstrapDialog.DEFAULT_TEXTS['OK'] = 'OK';
BootstrapDialog.DEFAULT_TEXTS['CANCEL'] = 'Cancel';
BootstrapDialog.DEFAULT_TEXTS['CONFIRM'] = 'Confirmation';