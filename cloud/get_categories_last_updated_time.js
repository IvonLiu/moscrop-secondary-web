exports.main = main;

var Category = Parse.Object.extend("Categories");

function main(request, response) {
	
    // Use master key to bypass ACL
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query(Category);
    query.addDescending("updatedAt");
    query.first().then(function(category) {
    	var updated = category.updatedAt.getTime();
    	response.success(updated);
    });
}