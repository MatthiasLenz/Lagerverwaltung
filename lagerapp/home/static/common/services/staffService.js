angular.module('baseApp.Services').
factory("staffService", function ($resource, $cacheFactory, sessionService) {
    var companyid = sessionService.getCompany;
    var companies = ['01', '04', '05']; //Todo: make it dynamic
    var staffCache = $cacheFactory('Staff');
    var resource = {};
    for (var i = 0; i < companies.length; i++) {
        resource[companies[i]] = $resource(
            "/api/" + companies[i] + "/staff/:id", {id: "@id"}, {query: {method: 'GET', cache: staffCache}}
        );
    }
    function staff_get(id) {
        return sessionService.getCompany().then(function(companyid) {
            return resource[companyid()].get(id).$promise;
        })
    }
    function staff_list(kwargs) {
        var company = "";
        if ("company" in kwargs){
            company = kwargs["company"];
        }
        else{
            company = companyid;
        }
        return sessionService.getCompany().then(function(companyid){
            return resource[company].query({'search': kwargs.search}).$promise;
        })
    }
    return {
        get: staff_get,
        list: staff_list
    };
});
