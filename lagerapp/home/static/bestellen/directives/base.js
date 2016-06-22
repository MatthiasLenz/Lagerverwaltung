angular.module('baseApp.bestellen').
directive('bestellenBase', function () {
    return {
        restrict: 'E',
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/bestellen/directives/base.html',
        controller: 'BestellungCtrl',
        controllerAs: 'bestellen'
    };
});
