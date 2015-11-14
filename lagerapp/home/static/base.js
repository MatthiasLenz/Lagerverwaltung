angular.module('baseApp.bestellen', []);
angular.module('baseApp', ['ngResource', 'baseApp.Services', 'docsTimeDirective', 'baseApp.bestellen']).

config(["$locationProvider", function ($locationProvider) {
    //disable this, if the app is being used by html5 incompatible browsers.
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);
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