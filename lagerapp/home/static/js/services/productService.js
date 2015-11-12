angular.module('baseApp.Services').
factory("productService", function ($resource, $cacheFactory) {
    var resourceCache = $cacheFactory('Product');
    var resource = $resource(
            '/api/product/:id',
        {},
        {query: {method: 'GET', cache: resourceCache, isArray: false}}
    );

    var model = {
            "page": 1,
            "ordering": "id",
            "perPage": 20,
            "query": "",
            "resourcenatureid": null
        }
    return {
        query: resource.query,
        model: model
    }
});
