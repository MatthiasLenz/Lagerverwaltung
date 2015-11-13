angular.module('baseApp', ['ngResource', 'baseApp.Services', 'docsTimeDirective']).

config(["$locationProvider", function ($locationProvider) {
    //disable this, if the app is being used by html5 incompatible browsers.
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]).
    directive('tabMenu', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: ['$scope', function ($scope) {
                var panes = $scope.panes = [];

                $scope.select = function (pane) {
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
        });
                    pane.selected = true;
                };

                this.addPane = function (pane) {
                    if (panes.length === 0) {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                };
            }],
            templateUrl: 'static/html/tab-menu.html'
        };
    })
    .directive('tabPane', function () {
        return {
            require: '^tabMenu',
            restrict: 'E',
            transclude: true,
            scope: {
                title: '@'
            },
            link: function (scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            templateUrl: 'static/html/tab-pane.html'
        };
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