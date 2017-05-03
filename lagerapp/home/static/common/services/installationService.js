angular.module('baseApp.Services').
factory("installationService", function ($resource,$cacheFactory,tokenService,sessionService,$http) {
    function getToken() {
        return "Token " + token;
    }
    var resourceCache = $cacheFactory('Installation');
    var machines = [];
    var resource = $resource(
        "/api/installation/:id", {id: "@id"},
        {
            query: {method: 'GET', cache: resourceCache, isArray: true},
            update: {method: 'PATCH', headers: {"Authorization": getToken}}
        }
    );
    function getTitles(){
        return resource.query({titlegrade:3}).$promise;
    }
    function init(){
        resource.query({title:'False'}).$promise.then(function (result) {
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
    function getMachine(id){
        return resource.get(id).$promise;
    }
    function update(id, values){
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return resource.update({id: id}, values).$promise;
        })
    }
    function create_rental(projectid, kwargs){
        var tokendata = null;
        return tokenService.getToken()
            .then(function (response) {
                tokendata = response;
                return sessionService.getCompany();
            })
            .then(function(loggedin_company){
                var company = "";
                //use company user is logged in with or specified company (in Lagerausgang)
                if ("company" in kwargs){
                    company = kwargs["company"];
                }
                else{
                    company = loggedin_company;
                }
                return $http({
                    method: 'POST',
                    url: '/api/' + company + '/rental/' + projectid,
                    data: kwargs,
                    dataType: 'json',
                    headers: {
                        "Authorization": "Token "+tokendata.token,
                        "Content-Type": "application/json"
                    }
                })
            });
    }
    return {
        init: init,
        getTitles: getTitles,
        getMachines: getMachines,
        getMachine: getMachine,
        update: update,
        create_rental: create_rental
    };
});