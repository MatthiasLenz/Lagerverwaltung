angular.module('baseApp.kleinmaschinen').
    directive('kleinmaschinen', function () {
        return {
            restrict: 'E',
            scope: {
                info: '=testattr'
            },
            templateUrl: 'static/kleinmaschinen/directives/base.html',
            controller: 'KleinmaschinenCtrl',
            controllerAs: 'maschinenVm'
        };
    });