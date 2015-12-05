angular.module('baseApp.bestellen').
directive('step1', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step1.html',
        controller: 'Step1Ctrl',
        controllerAs: 'step1'
    };
}).
directive('step2', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/bestellen/directives/step2.html',
        controller: 'Step2Ctrl',
        controllerAs: 'step2'
    };
}).
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