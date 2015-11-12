angular.module('baseApp.Services').
factory("productService", function ($resource) {
    return {
        "resource": $resource(
            '/api/product/:id',
            {per_page: 20, q: ""},
            {query: {method: 'GET', isArray: false}}
        ),
        "model": {
            "page": 1,
            "ordering": "id",
            "perPage": 20,
            "query": "",
            "resourcenatureid": null
        }
    }
});
