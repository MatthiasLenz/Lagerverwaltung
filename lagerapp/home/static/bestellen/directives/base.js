angular.module('baseApp.bestellen').
directive('bestellenBase', function () {
    return {
        restrict: 'A',
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/bestellen/directives/base.html',
        controller: 'BestellungCtrl',
        controllerAs: 'bestellen'
    };
});
