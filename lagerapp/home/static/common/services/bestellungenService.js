angular.module('baseApp.Services').
factory("bestellungenService", function ($resource) {
    var resource = $resource(
        "/api/purchasedoc/:id", {id: "@id"}, {}
    );
    var purchasedocs = [];
    resource.query().$promise.then(function (result) {
        result.forEach(function (item) {
            purchasedocs.push(item);
        });
    });

    return {
        purchasedocs: purchasedocs,
        resource: resource
    };
});