angular.module('baseApp.bestellen').
directive('step2', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step2.html',
        controller: 'Step2Ctrl',
        controllerAs: 'step2'
    };
});
