angular.module('baseApp.Services').
factory("projectService", function ($resource, $cacheFactory, sessionService) {
    var companyid = sessionService.getCompany;
    var companies = ['01', '04', '05']; //Todo: make it dynamic
    var projectCache = $cacheFactory('Project');
    var projects = {};
    for (var i = 0; i < companies.length; i++) {
        projects[companies[i]] = $resource(
            "/api/" + companies[i] + "/projects/:id", {id: "@id"}, {query: {method: 'GET', cache: projectCache}}
        );
    }
    function project_list(kwargs) {
        return projects[companyid()].query({'search': kwargs.search}).$promise;
    }
    function project_get(id) {
        return projects[companyid()].get(id).$promise;
    }

    return {
        get: project_get,
        project_list: project_list
    };
});
