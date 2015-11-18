angular.module('baseApp').
directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: ['$scope', 'bestellungenService', function ($scope, bestellungenService) {
            var controller = this;
            controller.list = bestellungenService.purchasedocs;
        }],
        controllerAs: 'bestellungen'
    };
});
