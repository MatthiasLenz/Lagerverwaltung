angular.module('baseApp.Services').
factory("installationService", function ($resource,$cacheFactory) {
    var resourceCache = $cacheFactory('Installation');
    var machines = [];
    var resource = $resource(
        "/api/installation/:id", {id: "@id"},
        {query: {method: 'GET', cache: resourceCache, isArray: true}}
    );
    function getTitles(){
        return resource.query({title:2}).$promise;
    }
    function init(){
        resource.query({title:3}).$promise.then(function (result) {
            result.forEach(function (item) {
                machines.push(item);
            });
        });
    }
    function getMachines(title){
        var result=[];
        machines.forEach(function(item){
            if (item["id"].substring(0,title.length)==title){
                result.push(item);
            }
        });
        return result;
    }
    return {
        init: init,
        getTitles: getTitles,
        getMachines: getMachines
    };
});