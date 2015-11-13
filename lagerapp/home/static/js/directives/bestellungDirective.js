angular.module('baseApp').
directive('bestellungDirective', function () {
    return {
        templateUrl: 'static/html/bestellunglist.html',
        controller: ['$scope', 'bestellungenService', function ($scope, bestellungenService) {
            var controller = this;
            controller.list = bestellungenService.bestellungen_list;
            window.scope3 = controller;
        }],
        controllerAs: 'bestellungen'
    };
});
