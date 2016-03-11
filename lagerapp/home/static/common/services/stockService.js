angular.module('baseApp.Services').
factory("stockService", function ($resource, $cacheFactory) {
    var resourceCache = $cacheFactory('Stock');
    var stockdata = $resource(
        '/api/stockdata/:id',
        {},
        {query: {method: 'GET', cache: resourceCache, isArray: false}}
    );
    var stock = $resource(
        '/api/stock/:id',
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

    function stockdataQuery(params) {
        return stockdata.query(params).$promise
    }

    function stockinfoQuery(params) {
        return stock.query(params).$promise
    }
    return {
        articlelist: stockdataQuery,
        stockinfo: stockinfoQuery,
        model: model,
        byCompany: {'01': '0', '04': '40', '05': '50'}
    }
});
