angular.module('baseApp.Services').
factory("stockService", function ($resource, $cacheFactory, sessionService) {
    var companyid = null;
    function init (){
        return sessionService.getCompany()
            .then(function (company){
                companyid = company;
                return companyid;
            })
    }
    var byCompany = {'01': '0', '04': '40', '05': '50'};
    var stockCache = $cacheFactory('Stock');
    var stockdataCache = $cacheFactory('StockData');
    var stockdata_noload = $resource(
        '/api/stockdata/:id',
        {},
        {query: {method: 'GET', cache: stockCache, isArray: false, ignoreLoadingBar: true}}
    );
    var stockdata = $resource(
        '/api/stockdata/:id',
        {},
        {query: {method: 'GET', cache: stockCache, isArray: false}}
    );
    var stock = $resource(
        '/api/stock/:id',
        {},
        {query: {method: 'GET', cache: true, isArray: false}}
    );
    var model = {
        "page": 1,
        "ordering": "id",
        "perPage": 20,
        "query": "",
        "resourcenatureid": null
    };

    function stockdataQuery_noload(params) {
        params.stockid = byCompany[companyid];
        return stockdata_noload.query(params).$promise
    }
    function stockdataQuery(params) {
        params.stockid = byCompany[companyid];
        return stockdata.query(params).$promise
    }
    function stockinfoQuery(params) {
        return stock.query(params).$promise
    }
    function currentStock(){
        return stock.query({id: byCompany[companyid]}).$promise;
    }
    return {
        init: init,
        articlelist_noload: stockdataQuery_noload,
        articlelist: stockdataQuery,
        stockinfo: stockinfoQuery,
        currentStock: currentStock,
        model: model,
        byCompany: byCompany
    }
});
