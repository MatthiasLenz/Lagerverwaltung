angular.module('baseApp', ['ngResource', 'baseApp.Services', 'docsTimeDirective']).

config(["$locationProvider", function ($locationProvider) {
    //disable this, if the app is being used by html5 incompatible browsers.
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]).
directive('headContent', function () {
        return {
            templateUrl: 'static/html/head.html',
            controller: [function () {
                this.title = 'Artikel Stammdaten';
            }],
            controllerAs: 'head'
        }
});

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