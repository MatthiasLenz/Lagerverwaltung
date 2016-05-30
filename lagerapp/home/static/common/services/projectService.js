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
        return projects[companyid()].query({'search': kwargs.search}).$promise;
    }
    function project_get(id) {
        return projects[companyid()].get(id).$promise;
    }
    function consumedproduct_create(selectedProject, data){
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata){
            return $http({
                method: 'POST',
                url: '/api/' + sessionService.getCompany() + '/consumedproduct/' + selectedProject.id,
                data: data,
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
