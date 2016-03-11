angular.module('baseApp.Services').
factory("supplierService", function ($resource, $cacheFactory, sessionService) {
    var companyid = sessionService.getCompany;
    var companies = ['01', '04', '05']; //Todo: make it dynamic
    var supplierCache = $cacheFactory('Supplier');
    var resource = {};
    for (var i = 0; i < companies.length; i++) {
        resource[companies[i]] = $resource(
            "/api/" + companies[i] + "/supplier/:id", {id: "@id"}, {query: {method: 'GET', cache: supplierCache}}
        );
    }
    function supplier_get(id) {
        return resource[companyid()].get(id).$promise;
    }

    return {
        get: supplier_get
    };
});
