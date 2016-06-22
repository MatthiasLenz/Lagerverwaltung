angular.module('baseApp.bestellenprojekt').
directive('bestellenprojekt', function () {
    return {
        restrict: 'E',
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/bestellen_projekt/directives/base.html',
        controller: 'BestellenProjektCtrl',
        controllerAs: 'bpVM'
    };
});