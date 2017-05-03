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
    var stockprojects = {"01": "1-7800", "04": "4-7800", "05": "5-7800"};

    function getCompanyFromID(projectid){
        return "0"+projectid.charAt(0);
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
    function consumedproduct_createfrompurchasedoc(purchasedoc, stock=false){
        //let purchasedoc = Object.assign({},purchasedoc_original);
        if (!stock) project = purchasedoc.modulerefid;

        var tokendata = null;
        return tokenService.getToken()
            .then(function (response) {
                tokendata = response;
                return sessionService.getCompany();
            })
            .then(function(loggedin_company){
                let company = "";
                //loggedin_company = company for stock
                //purchasedoc company = customer company
                //use company user is logged in with or specified company (in Lagerausgang)
                if ("company" in purchasedoc && !stock){
                    company = purchasedoc["company"];
                }
                else{
                    company = loggedin_company;
                }
                if (stock) {
                    project = stockprojects[loggedin_company];
                }
                return $http({
                    method: 'POST',
                    url: '/api/' + company + '/consumedproduct/' + project,
                    data: purchasedoc,
                    dataType: 'json',
                    headers: {
                        "Authorization": "Token "+tokendata.token,
                        "Content-Type": "application/json"
                    }
                })
            });
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

    function consumedproduct_delete(purchasedoc, stock=false){
        var tokendata = null;
        if (!stock) project = purchasedoc.modulerefid;
        return tokenService.getToken()
            .then(function (response) {
                tokendata = response;
                return sessionService.getCompany();
            })
            .then(function(loggedin_company){
                if (stock) project = stockprojects[loggedin_company];
                var company = "";
                //use company user is logged in with or specified company (in Lagerausgang)
                if ("company" in purchasedoc && !stock){
                    company = purchasedoc["company"];
                }
                else{
                    company = loggedin_company;
                }
                return $http({
                    method: 'DELETE',
                    url: '/api/' + company + '/consumedproduct/' + project,
                    data: purchasedoc,
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
        consumedproduct_create: consumedproduct_create,
        consumedproduct_createfrompurchasedoc: consumedproduct_createfrompurchasedoc,
        consumedproduct_delete: consumedproduct_delete,
        getCompanyFromID: getCompanyFromID
    };
});
