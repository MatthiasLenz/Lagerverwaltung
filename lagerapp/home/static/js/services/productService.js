angular.module('baseApp.Services').
factory("Product", function ($resource) {
    return $resource(
        "/api/productAll/:id", {id: "@id"}, {}
    );
});
