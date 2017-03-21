angular.module('baseApp.Services').
factory("installationService", function ($resource,$cacheFactory,tokenService) {
    function getToken() {
        return "Token " + token;
    }
    var resourceCache = $cacheFactory('Installation');
    var machines = [];
    var resource = $resource(
        "/api/installation/:id", {id: "@id"},
        {query: {method: 'GET', cache: resourceCache, isArray: true}},
        {update: {method: 'PATCH', headers: {"Authorization": getToken}}}
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
    function update(id, values){
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return resource.update(id, values).$promise
        })
    }
    return {
        init: init,
        getTitles: getTitles,
        getMachines: getMachines,
        update: update
    };
});