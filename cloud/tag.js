exports.create_cloud = create_cloud;
exports.update_cloud = update_cloud;
exports.addUser_cloud = addUser_cloud;
exports.removeUser_cloud = removeUser_cloud;
exports.getUsers_cloud = getUsers_cloud;

exports.create = create;
exports.update = update;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getUsers = getUsers;

var ResponseCodes = require('cloud/response_codes.js');
var Category = Parse.Object.extend("Categories");

function create_cloud(request, response) {
	var name = request.params.name;
	var id_author = request.params.id_author;
	var id_category = request.params.id_category;
	var icon_img = request.params.icon_img;
	create(name, id_author, id_category, icon_img, {
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

function update_cloud(request, response) {
	var name = request.params.name;
	var id_author = request.params.id_author;
	var id_category = request.params.id_category;
	var icon_img = request.params.icon_img;
	update(name, id_author, id_category, icon_img, {
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

function addUser_cloud(request, response) {
	var username = request.params.username;
	var tag = request.params.tag;
	addUser(username, tag, {
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

function removeUser_cloud(request, response) {
	var username = request.params.username;
	var tag = request.params.tag;
	removeUser(username, tag, {
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

function getUsers_cloud(request, response) {
	var tag = request.params.tag;
	getUsers(tag, {
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

/* Implementations */

function create(name, id_author, id_category, icon_img, callbacks) {

	var completeCount = 0;

    if (!name) {
        callbacks.error(ResponseCodes.MISSING_NAME, "Creating a tag requires a tag name");
        return;
    }

    if (!icon_img) {
        callbacks.error(ResponseCodes.MISSING_ICON_URL, "Creating a tag requries an icon URL");
        return;
    }

    if (!id_author) {
        id_author = "@null";
    }

    if (!id_category) {
        id_category = "@null";
    }

    var roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo("name", "moderator");
    roleQuery.first({
    	success: function(modRole) {
	        var roleACL = new Parse.ACL();
	        roleACL.setPublicReadAccess(true);
	        roleACL.setRoleWriteAccess(modRole, true);
	        var role = new Parse.Role(name, roleACL);
	        role.getRoles().add(modRole);
	        role.save({
	            success: function(newRole) {
	            	roleQuery.equalTo("name", "contributor");
	            	roleQuery.first({
	            		success: function(contributorRole) {
		            		contributorRole.getRoles().add(newRole);
		                    contributorRole.save({
		                        success: function(updatedContributorRole) {
    		                    	completeCount++;
			                    	if (completeCount == 2) {
			                        	callbacks.success(ResponseCodes.OK, null);
			                        	return;
			                    	}
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

	            	var category = new Category();
	                var categoryACL = new Parse.ACL();
	                categoryACL.setPublicReadAccess(true);
	                categoryACL.setRoleWriteAccess(modRole, true);
	                category.setACL(categoryACL);
	                category.save(
		                {
		                    name: name,
		                    id_author: id_author,
		                    id_category: id_category,
		                    icon_img: icon_img,
		                    group: newRole
		                }, 
		                {
		                    success: function(category) {
		                    	completeCount++;
		                    	if (completeCount == 2) {
		                        	callbacks.success(ResponseCodes.OK, null);
		                        	return;
		                    	}
		                    },
		                    error: function(category, error) {
		                        callbacks.error(error.code, error.message);
		                        return;
		                    }
		                }
		            );
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

function update(name, id_author, id_category, icon_img, callbacks) {

	if (!name) {
        callbacks.error(ResponseCodes.MISSING_NAME, "Creating a tag requires a tag name");
        return;
    }

    if (!icon_img) {
        callbacks.error(ResponseCodes.MISSING_ICON_URL, "Creating a tag requries an icon URL");
        return;
    }

    if (!id_author) {
        id_author = "@null";
    }

    if (!id_category) {
        id_category = "@null";
    }

    var query = new Parse.Query(Category);
    query.equalTo("name", name);
    query.first({
    	success: function(category) {
    		if (!category) {
    			callbacks.error(ResponseCodes.CATEGORY_NOT_FOUND, "Cannot find category " + name);
    			return;
    		}
    		category.set("id_author", id_author);
    		category.set("id_category", id_category);
    		category.set("icon_img", icon_img);
    		category.save(null, {
    			success: function(category) {
    				callbacks.success(ResponseCodes.OK, null);
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

function addUser(username, tag, callbacks) {
	
    // Use master key to bypass ACL
    Parse.Cloud.useMasterKey();

	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("username", username);
	userQuery.first({
		success: function(user) {
			if (!user) {
    			callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find user " + username);
    			return;
    		}
			var roleQuery = new Parse.Query(Parse.Role);
			roleQuery.equalTo("name", tag);
			roleQuery.first({
				success: function(role) {
					if (!role) {
    					callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find role " + tag);
    					return;
    				}
					user.relation("roles").add(role);
					user.save(null, {
						success: function(object) {
							role.getUsers().add(user);
							role.save({
								success: function(object) {
									callbacks.success(ResponseCodes.OK, null);
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

function removeUser(username, tag, callbacks) {

    // Use master key to bypass ACL
    Parse.Cloud.useMasterKey();

	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("username", username);
	userQuery.first({
		success: function(user) {
			if (!user) {
    			callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find user " + username);
    			return;
    		}
			var roleQuery = new Parse.Query(Parse.Role);
			roleQuery.equalTo("name", tag);
			roleQuery.first({
				success: function(role) {
					if (!role) {
    					callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find role " + tag);
    					return;
    				}					
					var completeCount = 0;
					user.relation("roles").remove(role);
					user.save(null, {
						success: function(object) {
							completeCount++;
							if (completeCount == 2) {
								callbacks.success(ResponseCodes.OK, null);
								return;
							}
						},
						error: function(object, error) {
							callbacks.error(error.code, error.message);
							return;
						}
					});
					role.getUsers().remove(user);
					role.save({
						success: function(object) {
							completeCount++;
							if (completeCount == 2) {
								callbacks.success(ResponseCodes.OK, null);
								return;
							}
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
		},
		error: function(object, error) {
			callbacks.error(error.code, error.message);
			return;
		}
	});
}

function getUsers(tag, callbacks) {
	var roleQuery = new Parse.Query(Parse.Role);
	roleQuery.equalTo("name", tag);
	roleQuery.first({
		success: function(role) {
			if (!role) {
				callbacks.error(ResponseCodes.USER_NOT_FOUND, "Cannot find role " + tag);
				return;
			}			
			var relationsQuery = role.getUsers().query();
			relationsQuery.find({
				success: function(users) {
					callbacks.success(ResponseCodes.OK, users);
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
