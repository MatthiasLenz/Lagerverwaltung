angular.module('baseApp.Services').
factory("bestellungenService", function ($resource) {
    var resource = $resource(
        "/api/purchasedoc/:id", {id: "@id"}, {}
    );
    var bestellungen_list = [];
    resource.query().$promise.then(function (result) {
        result.forEach(function (item) {
            bestellungen_list.push(item);
        });
    });

    return {
        bestellungen_list: bestellungen_list,
        resource: resource
    };
});