angular.module('baseApp.bestellen').
controller('BestellungCtrl', [function () {
    var ctrl = this;
    this.state = 'best1';
    window.bestellen = this;
    this.selectprod = function (product) {
        ctrl.selectedprod = product;
        ctrl.selectedsupp = null;
        ctrl.finished = false;
        ctrl.state = 'best2';
    };
    this.selectsupp = function (supplier) {
        ctrl.selectedsupp = supplier;
        ctrl.finished = false;
        ctrl.state = 'best3';
    };
    this.finish = function () {
        ctrl.state = 'best4';
        ctrl.finished = true;
    }
    this.selectState = function (state) {
        if (state == 'best1' ||
            (state == 'best2' && ctrl.selectedprod) ||
            (state == 'best3' && ctrl.selectedsupp) ||
            (state == 'best4' && ctrl.finished)) {
            this.state = state;
        }
    }
}]);