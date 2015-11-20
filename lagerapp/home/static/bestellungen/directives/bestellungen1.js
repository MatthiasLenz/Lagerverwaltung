angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', function ($scope, bestellungenService) {
            var controller = this;
            controller.list = bestellungenService.resource.query({'status': 1});
        }],
        controllerAs: 'bestellungen1'
    };
});