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
	                    /*var submitButton = document.getElementById("submitButton");
	                    var requestButton = document.getElementById("requestButton");
	                    if (userTags.data.length == 0) {
	                        submitButton.style.display = "none";
	                    } else {
	                        requestButton.style.display = "none";
	                    }*/

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

function logout() {
    Parse.User.logOut();
    currentUser = Parse.User.current();  // this will now be null
}