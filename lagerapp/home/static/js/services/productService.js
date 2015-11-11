angular.module('baseApp.Services').
factory("Product", function ($resource) {
    return $resource(
        '/api/product/:id',
        {per_page: 20, q: ""},
        {query: {method: 'GET', isArray: false}}
    );
});
