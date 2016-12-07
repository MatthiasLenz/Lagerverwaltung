angular.module('baseApp.Services').
factory("projectService", function ($resource, $cacheFactory, sessionService, tokenService, $http) {
    var companyid = sessionService.getCompany;
    var companies = ['01', '04', '05']; //Todo: make it dynamic
    var projectCache = $cacheFactory('Project');
    var projects = {};
    for (var i = 0; i < companies.length; i++) {
        projects[companies[i]] = $resource(
            "/api/" + companies[i] + "/projects/:id", {id: "@id"}, {query: {method: 'GET', cache: projectCache,
                isArray:false,ignoreLoadingBar: true}}
        );
    }
    
    function project_list(kwargs) {
        return sessionService.getCompany().then(function(companyid) {
            var company = "";
            if ("company" in kwargs){
                company = kwargs["company"];
            }
            else{
                company = companyid;
            }
            return projects[company].query(kwargs).$promise;
        });
    }
    function project_get(id) {
        return sessionService.getCompany().then(function(companyid) {
            return projects[companyid()].get(id).$promise;
        })
    }
    function consumedproduct_create(selectedProject, kwargs){
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
                    url: '/api/' + company + '/consumedproduct/' + selectedProject.id,
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
        get: project_get,
        project_list: project_list,
        consumedproduct_create: consumedproduct_create
    };
});
