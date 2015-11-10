angular.module('baseApp', ['ui.router', 'ngResource', 'baseApp.Services']).

config(["$locationProvider", function ($locationProvider) {
    //disable this, if the app is being used by html5 incompatible browsers.
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]).

config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/artikel");
    //
    // Now set up the states
    $stateProvider
        .state('artikel', {
            url: '/artikel',
            templateUrl: 'static/html/articlelist.html',
            controller: 'ArtikelCtrl',
            controllerAs: 'artikel',
            persist: true
        })
        .state('bestellmodul', {
            url: '/bestellmodul',
            templateUrl: 'static/html/bestellmodul.html',
            controller: 'BestellungCtrl',
            controllerAs: 'bst'
        })
        .state('lagereingang', {
            url: '/lagereingang',
            templateUrl: 'static/html/lagereingang.html',
        })
        .state('lagerausgang', {
            url: '/lagerausgang',
            templateUrl: 'static/html/lagerausgang.html',
        })
        .state('lagerverwaltung', {
            url: '/lagerverwaltung',
            templateUrl: 'static/html/lagerverwaltung.html',
        })
        .state('verrechnungen', {
            url: '/verrechnungen',
            templateUrl: 'static/html/verrechnungen.html',
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