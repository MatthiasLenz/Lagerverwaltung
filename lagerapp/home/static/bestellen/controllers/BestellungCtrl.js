angular.module('baseApp.bestellen').
controller('BestellungCtrl', [function () {
    var vm = this;
    this.state = 'best1';
    this.selectprod = function (product) {
        vm.selectedprod = product;
        vm.selectedsupp = null;
        vm.finished = false;
        vm.state = 'best2';
    };
    this.selectsupp = function (supplier) {
        vm.selectedsupp = supplier;
        vm.finished = false;
        vm.state = 'best3';
    };
    this.finish = function () {
        vm.state = 'best4';
        vm.finished = true;
    }
    this.selectState = function (state) {
        if (state == 'best1' ||
            (state == 'best2' && vm.selectedprod) ||
            (state == 'best3' && vm.selectedsupp) ||
            (state == 'best4' && vm.finished)) {
            this.state = state;
        }
    }
}]);