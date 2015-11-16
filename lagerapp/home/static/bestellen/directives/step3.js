angular.module('baseApp.bestellen').
directive('step3', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step3.html',
        controller: 'Step3Ctrl',
        controllerAs: 'step3'
    };
});
