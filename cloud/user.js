exports.addTag_cloud = addTag_cloud;
exports.removeTag_cloud = removeTag_cloud;
exports.getTags_cloud = getTags_cloud;
exports.setPermissionLevel_cloud = setPermissionLevel_cloud;
exports.getPermissionLevel_cloud = getPermissionLevel_cloud;

var ResponseCode = require('cloud/error_codes.js');
var Tag = require('cloud/tag.js');

function addTag_cloud(request, response) {
	var username = request.params.username;
	var tag = request.params.tag;
	addTag(username, tag, {
		success: function(object) {
			response.success(ResponseCode.OK);
		},
		error: function(error) {
			response.error(error);
		}
	});
}

function removeTag_cloud(request, response) {
	var username = request.params.username;
	var tag = request.params.tag;
	removeTag(username, tag, {
		success: function(object) {
			response.success(ResponseCode.OK);
		},
		error: function(error) {
			response.error(error);
		}
	});
}

function getTags_cloud(request, response) {
	var username = request.params.username;
	getTags(username, tag, {
		success: function(tags) {
			response.success(tags);
		},
		error: function(error) {
			response.error(error);
		}
	});
}

function setPermissionLevel_cloud(request, response) {
	var username = request.params.username;
	var level = request.params.level;
	setPermissionLevel(username, level, {
		success: function(object) {
			response.success(ResponseCode.OK);
		},
		error: function(error) {
			response.error(error);
		}
	});
}

function getPermissionLevel_cloud(request, response) {
	var username = request.params.username;
	var level = request.params.level;
	getPermissionLevel(username, level, {
		success: function(level) {
			response.success(level);
		},
		error: function(error) {
			response.error(error);
		}
	});
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
			var relationsQuery = user.relation("roles").query();
			relationsQuery.notContainedIn("name", ["admin", "moderator", "contributor"]);
			relationsQuery.find({
				success: function(roles) {
					callbacks.success(roles);
					return;
				},
				error: function(object, error) {
					callbacks.error(error);
					return;
				}
			});
		},
		error: function(object, error) {
			callbacks.error(error);
			return;
		}
	});
}

function setPermissionLevel(username, level, callbacks) {
	if (level == "administrator" || level == "moderator") {

		var roleQuery = new Parse.Query(Parse.Role);
		roleQuery.equalTo("name", level);
		roleQuery.first({
			success: function(role) {
				var userQuery = new Parse.Query(Parse.User);
				userQuery.equalTo("username", username);
				userQuery.first({
					success: function(user) {
						var completeCount = 0;
						role.getUsers().add(user);
						role.save({
							success: function(object) {
								completeCount++;
								if (completeCount == 2) {
									callbacks.success(ResponseCode.OK);
								}
							},
							error: function(object, error) {
								callbacks.error(error);
							}
						});
						user.set("permissionLevel", level);
						user.save({
							success: function(object) {
								completeCount++;
								if (completeCount == 2) {
									callbacks.success(ResponseCode.OK);
								}
							},
							error: function(object, error) {
								callbacks.error(error);
							}
						});
					},
					error: function(object, error) {
						callbacks.error(error);
					}
				});
			},
			error: function(object, error) {
				callbacks.error(error);
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
								var completeCount = 0;
								adminRole.getUsers().remove(user);
								adminRole.save({
									success: function(object) {
										completeCount++;
										if (completeCount == 3) {
											callbacks.success(ResponseCode.OK);
										}
									},
									error: function(object, error) {
										callbacks.error(error);
									}
								});
								modRole.getUsers().remove(user);
								modRole.save({
									success: function(object) {
										completeCount++;
										if (completeCount == 3) {
											callbacks.success(ResponseCode.OK);
										}
									},
									error: function(object, error) {
										callbacks.error(error);
									}
								});
								user.set("permissionLevel", "regular");
								user.save({
									success: function(object) {
										completeCount++;
										if (completeCount == 3) {
											callbacks.success(ResponseCode.OK);
										}
									},
									error: function(object, error) {
										callbacks.error(error);
									}
								});
							},
							error: function(object, error) {
								callbacks.error(error);
							}
						});
					},
					error: function(object, error) {
						callbacks.error(error);
					}
				});
			},
			error: function(object, error) {
				callbacks.error(error);
			}
		});

	}
}

function getPermissionLevel(username, callbacks) {
	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("username", username);
	userQuery.first({
		success: function(user) {
			callbacks.success(user.get("permissionLevel"));
		},
		error: function(object, error) {
			callbacks.error(error);
		}
	});
}