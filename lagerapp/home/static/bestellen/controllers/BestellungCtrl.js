angular.module('baseApp.bestellen').
controller('BestellungCtrl', [function () {
    var ctrl = this;
    this.state = 'best1';
    window.bestellen = this;
    this.selectprod = function (product) {
        ctrl.selectedprod = product;
        ctrl.state = 'best2';
    };
    this.selectsupp = function (supplier) {
        ctrl.selectedsupp = supplier;
        ctrl.state = 'best3';
    };
    this.selectState = function (state) {
        if (state == 'best1' ||
            (state == 'best2' && ctrl.selectedprod) ||
            (state == 'best3' && ctrl.selectedsupp)) {
            this.state = state;
        }
    }
}]);