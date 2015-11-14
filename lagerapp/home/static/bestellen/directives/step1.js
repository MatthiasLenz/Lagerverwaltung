angular.module('baseApp.bestellen').
directive('step1', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step1.html',
        controller: 'Step1Ctrl',
        controllerAs: 'step1'
    };
});
