angular.module('baseApp.Services').
factory("supplierService", function ($resource, $cacheFactory, sessionService) {
    var companyid = null;
    function init (){
        return sessionService.getCompany()
            .then(function (company){
                companyid = company;
                return companyid;
            })
    }
    var companies = ['01', '04', '05']; //Todo: make it dynamic
    var supplierCache = $cacheFactory('Supplier');
    var resource = {};
    for (var i = 0; i < companies.length; i++) {
        resource[companies[i]] = $resource(
            "/api/" + companies[i] + "/supplier/:id", {id: "@id"}, {query: {method: 'GET', cache: supplierCache}}
        );
    }
    function supplier_get(id) {
        return resource[companyid].get(id).$promise;
    }
    function supplier_list(kwargs) {
        return resource[companyid].query({'search': kwargs.search}).$promise;
    }
    return {
        init: init,
        list: supplier_list,
        get: supplier_get
    };
});
