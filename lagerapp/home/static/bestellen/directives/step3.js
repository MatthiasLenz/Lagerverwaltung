angular.module('baseApp.bestellen').
directive('step3', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step3.html',
        controller: 'Step3Ctrl',
        controllerAs: 'step3'
    };
}).
directive('step4', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step4.html',
        controller: ['$scope', function ($scope) {
            var controller = this;
        }],
        controllerAs: 'step4'
    };
});
