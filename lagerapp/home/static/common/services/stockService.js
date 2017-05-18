angular.module('baseApp.Services').
factory("stockService", function ($resource, $cacheFactory, sessionService, tokenService) {
    var companyid = null;
    var stockbyid = null;
    var token;
    function getToken() {
        return "Token " + token;
    }
    function clearCache() {
        stockdataCache.removeAll();
    }
    function init (){
        sessionService.getConfig().then(function(response){
            stockbyid = response.stockbyid;
            companyid = response.company.id;
        });
    }
    var stockCache = $cacheFactory('Stock');
    var stockdataCache = $cacheFactory('StockData');
    var stockdata_noload = $resource(
        '/api/stockdata/:id',
        {},
        {query: {method: 'GET', cache: stockdataCache, isArray: false, ignoreLoadingBar: true}}
    );
    var stockdata = $resource(
        '/api/stockdata/:id', {id: "@id"},{
            query: {method: 'GET', cache: stockdataCache, isArray: false},
            update: {method: 'PATCH',  cache: stockdataCache, headers: {"Authorization": getToken}}
        }
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
    function get_stockbyid(){
        return stockbyid;
    }
    function stockdataQuery_noload(params) {
        params.stockid = stockbyid[companyid];
        return stockdata_noload.query(params).$promise
    }
    function stockdataQuery(params) {
        params.stockid = stockbyid[companyid];
        return stockdata.query(params).$promise
    }
    function stockdata_getbyprodid(id) {
        params = {stockid:stockbyid[companyid], prodid__id : id };
        return stockdata.query(params).$promise;
    }
    //vielleicht zusammen mit 1-7800
    function stockdata_update(id, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return stockdata.update(id, data).$promise;
        }).then(function (response) {
            clearCache();
            return response;
        });
    }
    function stockinfoQuery(params) {
        return stock.query(params).$promise
    }
    function currentStock(){
        return stock.query({id: stockbyid[companyid]}).$promise;
    }

    return {
        init: init,
        articlelist_noload: stockdataQuery_noload,
        articlelist: stockdataQuery,
        stockinfo: stockinfoQuery,
        stockdata_update: stockdata_update,
        stockdata_getbyprodid: stockdata_getbyprodid,
        currentStock: currentStock,
        model: model,
        byCompany: get_stockbyid
    }
});
