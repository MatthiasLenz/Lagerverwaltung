angular.module('baseApp.Services').
factory("stockService", function ($resource, $cacheFactory) {
    var resourceCache = $cacheFactory('Stock');
    var resource = $resource(
        '/api/stockdata/:id',
        {},
        {query: {method: 'GET', cache: resourceCache, isArray: false}}
    );

    var model = {
        "page": 1,
        "ordering": "id",
        "perPage": 20,
        "query": "",
        "resourcenatureid": null
    };

    function query_prod(params) {
        return resource.query(params).$promise
    }

    return {
        query: query_prod,
        model: model
    }
});
