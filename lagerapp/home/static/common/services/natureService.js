angular.module('baseApp.Services').
factory("natureService", function ($resource, $http) {
    var resource = $resource(
        "/api/nature/:id", {id: "@id"}, {}
    );

    var nature_list = [{"id": "", "name": "- Bitte auswählen -", "title": ""}];
    var nature_list_stock = [{"id": "", "name": "- Bitte auswählen -", "title": ""}];
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
    $http.get("/api/01/stocknatures/").then(function (results){
        results.data.data.forEach(function (item){
            if (item.title)  {
                titleDescr = item.Name;
            }
            else {
                nature_list_stock.push({"id": item.ID, "name": item.Name, "title": titleDescr});
            }
        });
        console.log(nature_list_stock);
    });

    return {
        nature_list: nature_list,
        stocknature_list: nature_list_stock,
        resource: resource
    };
});

/* how you add custom methods:
 "reviews": {
 'method': 'GET',
 'params': {'reviews_only': "true"},
 isArray: true
 }*/