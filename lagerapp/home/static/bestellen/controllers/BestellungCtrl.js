angular.module('baseApp.bestellen').
controller('BestellungCtrl', [function () {
    var ctrl = this;
    this.state = 'best1';
    window.bestellen = this;
    this.select = function (product) {
        ctrl.selected = product;
        ctrl.state = 'best2';
    }
}]);