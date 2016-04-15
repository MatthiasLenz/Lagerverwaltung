angular.module('baseApp.lagerausgang').
directive('lagerausgang', function () {
    return {
        restrict: 'A',
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/lagerausgang/directives/base.html',
        controller: 'LagerausgangCtrl',
        controllerAs: 'lagerVm'
    };
});