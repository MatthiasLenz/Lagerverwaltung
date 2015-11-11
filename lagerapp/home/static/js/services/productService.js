angular.module('baseApp.Services').
factory("Product", function ($resource) {
    return $resource(
        "/api/productall/:id", {id: "@id"}, {}
    );
});
