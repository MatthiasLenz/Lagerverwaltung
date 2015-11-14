angular.module('baseApp.bestellen').
directive('bestellenBase', function () {
    return {
        restrict: 'A',
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/bestellen/directives/base.html',
        controller: [function () {
            var ctrl = this;
            this.state = 'best1';
            this.select = function (product) {
                ctrl.selected = product;
                ctrl.state = 'best2';
            }
        }],
        controllerAs: 'bestellen'
    };
});
