angular.module('baseApp.Services', ['ngResource']).
factory("natureService", function ($resource) {
    var resource = $resource(
        "/api/nature/:id", {id: "@id"}, {}
    );
    var nature_list = [{"id": "", "name": "- Bitte auswählen -", "title": ""}];
    resource.query().$promise.then(function (result) {
        var titleDescr = "";
        result.forEach(function (item) {
            if (item.title) {
                titleDescr = item.name;
            }
            else {
                nature_list.push({"id": item.id, "name": item.name, "title": titleDescr});
            }
        });
    });
    return {
        nature_list: nature_list,
        resource: resource
    };
});
/* how you add custom methods:
 "reviews": {
 'method': 'GET',
 'params': {'reviews_only': "true"},
 isArray: true
 }*/