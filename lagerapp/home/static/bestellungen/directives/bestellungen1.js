angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', function ($scope, bestellungenService, supplierService) {
            var controller = this;
            controller.list = [];
            bestellungenService.list({'status': 1}).then(function (result) {
                controller.list = result;
                supplier = supplierService.resource.query({'id': controller.list.supplierid});
                controller.list.supplierid = supplier;
            });
        }],
        controllerAs: 'bestellungen1'
    };
});
