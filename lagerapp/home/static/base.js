angular.module('baseApp.bestellen', []);
angular.module('baseApp.lagerausgang', []);
angular.module('baseApp.Services', ['ngResource']);
var baseApp = angular.module('baseApp', ['ui.bootstrap', 'ngResource', 'ngMaterial', 'baseApp.Services',
    'docsTimeDirective', 'baseApp.bestellen', 'angular-loading-bar', 'ngAnimate', 'baseApp.lagerausgang']);

baseApp.config(["$locationProvider", function ($locationProvider) {
    //disable this, if the app is being used by html5 incompatible browsers.
    $locationProvider.html5Mode({
        enabled: true
        //requireBase: false
    });
}]);

angular.element(document).ready(function () {
    angular.bootstrap(document, ["baseApp"]);
});

/*
//load data before bootstrap
(function () {
    angular.module('baseApp.bestellen', []);
    angular.module('baseApp.lagerausgang', []);
    angular.module('baseApp.Services', ['ngResource']);
    var baseApp = angular.module('baseApp', ['ui.bootstrap', 'ngResource', 'ngMaterial', 'baseApp.Services',
        'docsTimeDirective', 'baseApp.bestellen', 'angular-loading-bar', 'ngAnimate', 'baseApp.lagerausgang']);

    fetchData().then(bootstrapApplication);

    function fetchData() {
        //var loginService = angular.injector(["ng", "ui.bootstrap", "baseApp.Services"]).get("loginService");
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");
        return $http({
            method: 'GET',
            url: '/api/01/staff',
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response){
            baseApp.constant("config", response.data);
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function () {
        angular.bootstrap(document, ["baseApp"]);
    });
    }
}());*/

/*    How to transform a query to a paginated resource, so that it returns the results directly
 artikelApp.factory("Product",
 function ($resource) {
 return $resource("/api/product/:id", {},{
 //override .query
 query: {
 method: 'GET',
 url: 'api/product/',
 isArray: true,
 transformResponse: function(data, headers) {
 return angular.fromJson(data).results;
 },
 },
 });
 }
 ); */