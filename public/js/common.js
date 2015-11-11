Parse.initialize("TtFxol5uKm6piqaomYYvaTtezhRJQFZFRadc9qit", "smiduKJqXsJXvEnYj5nUSBFxxTXMpHiZZibVVyLx");
var currentUser = Parse.User.current();

var Category = Parse.Object.extend("Categories");
var mCategories;

var mUserPermissionLevel;
var mUserTags;

$(document).ready(function(){

    // Initialize modals
    $('.modal-trigger').leanModal();

    // Make sure the correct navbar actions are being shown
	var divLoggedInActions = document.getElementById("loggedInActions");
	var divLoggedOutActions = document.getElementById("loggedOutActions");

	// Verify user permissions
	// and show elements accordingly
    if (currentUser) {

    	// User is logged in
	    divLoggedOutActions.style.display = "none";

	    // Setup navbar elements
	    $(".dropdown-button").dropdown({ hover: false });
	    document.getElementById("username").innerHTML = currentUser.getUsername();

	    // Get user permissions
	    params = {
	        username: currentUser.getUsername(),
	    };
	    Parse.Cloud.run("User_getPermissionLevel", params, {
	        success: function(permissionLevel) {
	            Parse.Cloud.run("User_getTags", params, {
	                success: function(userTags) {

	                    //console.log("Permission level: " + permissionLevel.data);
	                    //console.log("Tags: " + JSON.stringify(userTags.data) + ", with " + userTags.data.length + " elements");

	                    mUserPermissionLevel = permissionLevel.data;
	                    mUserTags = userTags.data;

	 					// Only show admin button to
	 					// administrators and moderators                   
	                    if (permissionLevel.data == "regular") {                            
	                        var adminButton = document.getElementById("adminButton");
	                        adminButton.style.display = "none";
	                    }

	                    // Show submit button if user
	                    // belongs to at least one category.
	                    // Otherwise, show request button.
	                    var submitButton = document.getElementById("submitButton");
	                    var requestButton = document.getElementById("requestButton");
	                    if (userTags.data.length == 0) {
	                        submitButton.style.display = "none";
	                    } else {
	                        requestButton.style.display = "none";
	                    }

	                    // Now that navbar is prepared,
	                    // show it.
	                    $("div#toolbarActions").removeClass("hidden");

	                    // Call page specific init
	                    if (typeof init != "undefined") {
	                    	init();
	                	}
	                },
	                error: function(error) {
	                	// Ignore errors for now.
	                }
	            });
	        },
	        error: function(error) {
	        	// Ignore errors for now.
	        }
	    });
	} else {
	    // show the signup or login page
	    divLoggedInActions.style.display = "none";
	    $("div#toolbarActions").removeClass("hidden");
	}

});

function openRequestModal() {
    $('#request_access_modal').openModal();

    if (mCategories) {
        populateRequestModal();
    } else {
        var query = new Parse.Query(Category);
        query.ascending("name");
        query.find().then(function(categories) {
            mCategories = categories;
            populateRequestModal();
        });
    }
}

function populateRequestModal() {
    var form = document.getElementById('available_categories');
    form.innerHTML = "";
    $.each(
        mCategories,
        function(i, category) {
            var item = document.createElement("p");
            var label = document.createElement("label");
            var checkbox = document.createElement("input");
            var description = category.get("name");

            checkbox.type = "checkbox";
            checkbox.name = "categories";
            checkbox.id = "category" + i;
            checkbox.value = description;

            label.htmlFor = checkbox.id;
            label.innerHTML = description;
            label.className = "black-text";

            item.appendChild(checkbox);
            item.appendChild(label);

            form.appendChild(item);
        }
    );
}

function addClub() {
    var newClubField = document.getElementById("request_new_club");
    var newClub = newClubField.value;

    for (var i=0; i<mCategories.length; i++) {
        if (mCategories[i].get("name") == newClub) {
            Materialize.toast('This club already exists', 4000);
            return; 
        }
    }

    if (newClub) {
        var form = document.getElementById('available_categories');
        var item = document.createElement("p");
        var label = document.createElement("label");
        var checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.name = "new_categories";
        checkbox.id = "newClub_"+newClub;
        checkbox.value = newClub;
        checkbox.checked = true;

        label.htmlFor = checkbox.id;
        label.innerHTML = newClub;
        label.className = "black-text";

        item.appendChild(checkbox);
        item.appendChild(label);

        form.appendChild(item);
        newClubField.value = "";
    }
}

function sendAccessRequest() {

    var selectedCategories = [];
    $.each($("input[name='categories']:checked"), function(){            
        selectedCategories.push($(this).val());
    });

    var newCategories = [];
    $.each($("input[name='new_categories']:checked"), function(){            
        newCategories.push($(this).val());
    });                

    var params = {
        categories: selectedCategories,
        newCategories: newCategories
    };

    Parse.Cloud.run('User_requestCategoryAccess', params, {
        success: function(response) {
            console.log(JSON.stringify(response));
            switch (response.code) {
                case "1007": {
                    alert("You need to select at least one category");
                    break;
                }
                default: {
                    Materialize.toast("Request submitted. Please await moderator approval!", 4000);
                    $('#request_access_modal').closeModal();
                }
            }

        },
        error: function(response) {
            console.log(JSON.stringify(response));
        }
    });    
}

function logout() {
    Parse.User.logOut();
    currentUser = Parse.User.current();  // this will now be null
}