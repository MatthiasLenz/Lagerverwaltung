angular.module('baseApp.Services')
.factory("installationService", ['$resource','$cacheFactory','tokenService','sessionService','$http', function ($resource,
        $cacheFactory,tokenService,sessionService,$http) {


    function getToken() {
        return "Token " + token;
    }

    var resourceCache = $cacheFactory('Installation');
    var originalPut = resourceCache.put;
    resourceCache.keys = [];
    // overwrite put() with a custom method
    resourceCache.put = function (key, value) {
        // call original put() and save the key
        if (originalPut(key, value)) {
            resourceCache.keys.push(key);
        }
    };
    resourceCache.items = function (){
        let result = {};
        for (let i=0;i<resourceCache.keys.length;i++){
            let key = resourceCache.keys[i];
            result[key] = resourceCache.get(key);
        }
        return result;
    };

    var machines = [];
    var titles = {};


    var resource = $resource(
        "/api/installation/:id", {id: "@id"},
        {
            query: {method: 'GET', cache: resourceCache, isArray: true},
            update: {method: 'PATCH', cache: resourceCache, headers: {"Authorization": getToken}}
        }
    );
    function getTitles(){
        return resource.query({titlegrade:3}).$promise;
    }
    function init(){
        resource.query({title:'False'}).$promise.then(function (result) {
            machines.length = 0; //clear array (javascript quirk)
            result.forEach(function (item) {
                machines.push(item);
            });
        });
        resource.query({}).$promise.then(function (result) {
            let title;
            result.forEach(function (item) {
                if (item.title){
                    title = item.id;
                    titles[title] = [];
                }
                else {
                    titles[title].push(item);
                }
            });
        });
    }
    function getMachines1(title){
        let result=[];
        machines.forEach(function(item){
            if (item["id"].substring(0,title.length)==title){
                result.push(item);
            }
        });
        return result;
    }
    function getMachines(title){
        return titles[title];
    }
    function getMachine(id){
        return resource.get(id).$promise;
    }
    function update(id, values){
        resourceCache.removeAll();
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
    function getCache(){
        return resourceCache;
    }
    return {
        init: init,
        getTitles: getTitles,
        getMachines: getMachines,
        getMachine: getMachine,
        machines: machines,
        update: update,
        create_rental: create_rental,
        cache: getCache
    };
}]);

