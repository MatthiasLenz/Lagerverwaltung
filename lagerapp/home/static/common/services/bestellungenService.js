angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var resource = $resource(
        "/api/purchasedoc/:id", {id: "@id"}, {query: {method: 'GET', cache: purchasedocCache, isArray: true}}
    );
    var purchasedocs = [];
    resource.query({'status': 0}).$promise.then(function (result) {
        result.forEach(function (item) {
            purchasedocs.push(item);
        });
    });

    return {
        purchasedocs: purchasedocs,
        resource: resource
    };
});