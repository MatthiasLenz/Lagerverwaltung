angular.module('baseApp.Services').
factory("supplierService", function ($resource, $cacheFactory) {
    var supplierCache = $cacheFactory('Supplier');
    var resource = $resource(
        "/api/supplier/:id", {id: "@id"}, {query: {method: 'GET', cache: supplierCache}}
    );
    return {
        resource: resource
    };
});
