exports.addTag_cloud = addTag_cloud;
exports.removeTag_cloud = removeTag_cloud;
exports.getTags_cloud = getTags_cloud;
exports.setPermissionLevel_cloud = setPermissionLevel_cloud;
exports.getPermissionLevel_cloud = getPermissionLevel_cloud;
exports.requestCategoryAccess_cloud = requestCategoryAccess_cloud;

var ResponseCodes = require('cloud/response_codes.js');
var Tag = require('cloud/tag.js');
var Mailgun = require('mailgun');

function addTag_cloud(request, response) {
	var username = request.params.username;
	var tag = request.params.tag;
	addTag(username, tag, {
		success: function(responseCode, object) {
			response.success({
				code: responseCode,
				data: object
			});
		},
		error: function(responseCode, errorMsg) {
			response./*error*/success({
				code: responseCode,
				data: errorMsg
			});
		}
	});
}

function removeTag_cloud(request, response) {
	var username = request.params.username;
	var tag = request.params.tag;
	removeTag(username, tag, {
		success: function(responseCode, object) {
			response.success({
				code: responseCode,
				data: object
			});
		},
		error: function(responseCode, errorMsg) {
			response./*error*/success({
				code: responseCode,
				data: errorMsg
			});
		}
	});
}

function getTags_cloud(request, response) {
	var username = request.params.username;
	getTags(username, {
		success: function(responseCode, object) {
			response.success({
				code: responseCode,
				data: object
			});
		},
		error: function(responseCode, errorMsg) {
			response./*error*/success({
				code: responseCode,
				data: errorMsg
			});
		}
	});
}

function setPermissionLevel_cloud(request, response) {
	var username = request.params.username;
	var level = request.params.level;
	setPermissionLevel(username, level, {
		success: function(responseCode, object) {
			response.success({
				code: responseCode,
				data: object
			});
		},
		error: function(responseCode, errorMsg) {
			response./*error*/success({
				code: responseCode,
				data: errorMsg
			});
		}
	});
}

function getPermissionLevel_cloud(request, response) {
	var username = request.params.username;
	getPermissionLevel(username, {
		success: function(responseCode, object) {
			response.success({
				code: responseCode,
				data: object
			});
		},
		error: function(responseCode, errorMsg) {
			response./*error*/success({
				code: responseCode,
				data: errorMsg
			});
		}
	});
}

function requestCategoryAccess_cloud(request, response) {
	var categories = request.params.categories;
	var newCategories = request.params.newCategories;
	if (categories.length == 0 && newCategories.length == 0) {
		response.success({
			code: ResponseCodes.ARRAY_SIZE_ZERO,
			data: "You need to specify at least one category"
		});
	} else {
		requestCategoryAccess(request.user, categories, newCategories, {
			success: function(responseCode, object) {
				response.success({
					code: responseCode,
					data: object
				});
			},
			error: function(responseCode, errorMsg) {
				response.success({
					code: responseCode,
					data: errorMsg
				});
			}
		});
	}
}

/* Implementations */

function addTag(username, tag, callbacks) {
	Tag.addUser(username, tag, callbacks);
}

function removeTag(username, tag, callbacks) {
	Tag.removeUser(username, tag, callbacks);
}

function getTags(username, callbacks) {
	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("username", username);
	userQuery.first({
		success: function(user) {
			if (!user) {
    			callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find user " + username);
    			return;
    		}			
			var relationsQuery = user.relation("roles").query();
			relationsQuery.notContainedIn("name", ["admin", "moderator", "contributor"]);
			relationsQuery.find({
				success: function(roles) {
					callbacks.success(ResponseCodes.OK, roles);
					return;
				},
				error: function(object, error) {
					callbacks.error(error.code, error.message);
					return;
				}
			});
		},
		error: function(object, error) {
			callbacks.error(error.code, error.message);
			return;
		}
	});
}

function setPermissionLevel(username, level, callbacks) {

    // Use master key to bypass ACL
    Parse.Cloud.useMasterKey();
	
	if (level == "administrator" || level == "moderator") {

		var roleQuery = new Parse.Query(Parse.Role);
		roleQuery.equalTo("name", level);
		roleQuery.first({
			success: function(role) {				
				var userQuery = new Parse.Query(Parse.User);
				userQuery.equalTo("username", username);
				userQuery.first({
					success: function(user) {
						if (!user) {
			    			callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find user " + username);
			    			return;
			    		}						
						var completeCount = 0;
						role.getUsers().add(user);
						role.save({
							success: function(object) {
								completeCount++;
								if (completeCount == 2) {
									callbacks.success(ResponseCodes.OK, null);
								}
							},
							error: function(object, error) {
								callbacks.error(error.code, error.message);
							}
						});
						user.set("permissionLevel", level);
						user.save(null, {
							success: function(object) {
								completeCount++;
								if (completeCount == 2) {
									callbacks.success(ResponseCodes.OK, null);
								}
							},
							error: function(object, error) {
								callbacks.error(error.code, error.message);
							}
						});
					},
					error: function(object, error) {
						callbacks.error(error.code, error.message);
					}
				});
			},
			error: function(object, error) {
				callbacks.error(error.code, error.message);
			}
		});

	} else {

		var roleQuery = new Parse.Query(Parse.Role);
		roleQuery.equalTo("name", "administrator");
		roleQuery.first({
			success: function(adminRole) {
				roleQuery.equalTo("name", "moderator");
				roleQuery.first({
					success: function(modRole) {
						var userQuery = new Parse.Query(Parse.User);
						userQuery.equalTo("username", username);
						userQuery.first({
							success: function(user) {
								if (!user) {
					    			callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find user " + username);
					    			return;
					    		}									
								var completeCount = 0;
								adminRole.getUsers().remove(user);
								adminRole.save({
									success: function(object) {
										completeCount++;
										if (completeCount == 3) {
											callbacks.success(ResponseCodes.OK, null);
										}
									},
									error: function(object, error) {
										callbacks.error(error.code, error.message);
									}
								});
								modRole.getUsers().remove(user);
								modRole.save({
									success: function(object) {
										completeCount++;
										if (completeCount == 3) {
											callbacks.success(ResponseCodes.OK, null);
										}
									},
									error: function(object, error) {
										callbacks.error(error.code, error.message);
									}
								});
								user.set("permissionLevel", "regular");
								user.save(null, {
									success: function(object) {
										completeCount++;
										if (completeCount == 3) {
											callbacks.success(ResponseCodes.OK, null);
										}
									},
									error: function(object, error) {
										callbacks.error(error.code, error.message);
									}
								});
							},
							error: function(object, error) {
								callbacks.error(error.code, error.message);
							}
						});
					},
					error: function(object, error) {
						callbacks.error(error.code, error.message);
					}
				});
			},
			error: function(object, error) {
				callbacks.error(error.code, error.message);
			}
		});

	}
}

function getPermissionLevel(username, callbacks) {
	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("username", username);
	userQuery.first({
		success: function(user) {
			if (!user) {
    			callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find user " + username);
    			return;
    		}				
    		var permissionLevel = user.get("permissionLevel");
    		if (!permissionLevel) {
    			permissionLevel = "regular";
    		}
			callbacks.success(ResponseCodes.OK, permissionLevel);
		},
		error: function(object, error) {
			callbacks.error(error.code, error.message);
		}
	});
}

function requestCategoryAccess(user, categories, newCategories, callbacks) {
	Mailgun.initialize('sandbox8f3d3bb906f04819befc43669fa7fd21.mailgun.org', 'key-7a0ce92765832b38d88fcbda4d766d2f');

	var username = user.getUsername();
	var subject = "Category Access Request from " + username;

	var query = new Parse.Query(Parse.User);
	query.containedIn("permissionLevel", [ "moderator", "administrator" ]);
	query.find({
		success: function(moderators) {
			var recipients = [];
			for (var i=0; i<moderators.length; i++) {
				recipients.push(moderators[i].getEmail());
			}
			var to = recipients.join(";");
			var text = username + " has requested permissions to contribute to the following categories:\n";
			for (var i=0; i<categories.length; i++) {
				text += "\n";
				text += categories[i];
			}
			text += "\n\nand has requested the creation of the following categories:\n";
			for (var i=0; i<newCategories.length; i++) {
				text += "\n";
				text += newCategories[i];
			}
			text += "\n\nHandle this request: http://moscropsecondary.parseapp.com/usermanager.html";

			Mailgun.sendEmail({
		        to: to,
		        from: "no-reply@moscropsecondary.parseapp.com",
		        subject: subject,
		        text: text
		    }, {
		        success: function(httpResponse) {
		            callbacks.success(ResponseCodes.OK, null);
		        },
		        error: function(httpResponse) {
		            callbacks.error(ResponseCodes.ERROR, "Failed to send email");
		        }
		    });
		},
		error: function(object, error) {
			callbacks.error(error.code, error.message);
		}
	});
}