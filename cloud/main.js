/**
 * This is the complete list of Clouc Code functions
 * the backend supports right now. Think of this as
 * the header file. However, since this is Cloud Code,
 * the way you call methods is slightly different than
 * the way you call normal JavaScript methods.
 *
 * Sample:
 *
 * If a cloud function were defined as

 	Parse.Cloud.define("sample_cloud_function", sampleCloudFunction.main);

 * then, you would call it with

	Parse.Cloud.run('sample_cloud_function', params, {
	    success: function(object) {
	        // Handle success here
		},
	    error: function(error) {
	        // Handle error here
	    }
	});

 * Notes:
 * 
 * - Because of Cloud Code limitations, put arguments into params object as such:

	params = {
		arg0: value0,
		arg1: value1,
		// ...
		argN: valueN
	};

 * - Response will be a JSON object containing the repsonse code and a data object
 * 	if the method is supposed to return a value. Otherwise the data object will
 *	be undefined. There will always be a response code. You may find out what the
 *	response code means in cloud/error_codes.js.
 */

/********************************/
/********** DO NOT USE **********/
/********************************/

/**
 * For cron job use only
 */
var fetchFromBlogger = require('cloud/fetch_from_blogger.js');
Parse.Cloud.define("fetchFromBlogger", fetchFromBlogger.main);

/**
 * For mobile client use only
 */
var getCategoriesLastUpdatedTime = require('cloud/get_categories_last_updated_time.js');
Parse.Cloud.define("getCategoriesLastUpdatedTime", getCategoriesLastUpdatedTime.main);

/*************************/
/********** Tag **********/
/*************************/
var Tag = require('cloud/tag.js');

/**
 * Creates a new tag
 * @param {String} name
 * @param {String} id_author
 * @param {String} id_category
 * @param {String} icon_img
 */
Parse.Cloud.define("Tag_create", Tag.create_cloud);

/**
 * Update an existing tag
 * @param {String} name
 * @param {String} id_author
 * @param {String} id_category
 * @param {String} icon_img
 */
Parse.Cloud.define("Tag_update", Tag.update_cloud);

/**
 * Add a user to a specified tag
 * @param {String} username
 * @param {String} tag
 */
Parse.Cloud.define("Tag_addUser", Tag.addUser_cloud);

/**
 * Remove a user from a specified tag
 * @param {String} username
 * @param {String} tag
 */
Parse.Cloud.define("Tag_removeUser", Tag.removeUser_cloud);

/**
 * Get all users of this tag
 * @param {String} tag
 * @return {Parse.User[]} users
 */
Parse.Cloud.define("Tag_getUsers", Tag.getUsers_cloud);

/**************************/
/********** User **********/
/**************************/
var User = require('cloud/user.js');

/**
 * Add a tag to a specified user
 * @param {String} username
 * @param {String} tag
 */
Parse.Cloud.define("User_addTag", User.addTag_cloud);

/**
 * Remove a tag from a specified user
 * @param {String} username
 * @param {String} tag
 */
Parse.Cloud.define("User_removeTag", User.removeTag_cloud);

/**
 * Get a list of all tags the user belongs to
 * @param {String} username
 * @return {Parse.Role[]} tags
 */
Parse.Cloud.define("User_getTags", User.getTags_cloud);

/**
 * Sets a user's permission level to one
 * of the three levels: administrator, moderator, regular
 * @param {String} username
 * @param {String} level
 */
Parse.Cloud.define("User_setPermissionLevel", User.setPermissionLevel_cloud);

/**
 * Gets a user's permission level
 * Returns adminRole or modRole, or null
 * @param {String} username
 * @return {Parse.Role} level
 */
Parse.Cloud.define("User_getPermissionLevel", User.getPermissionLevel_cloud);