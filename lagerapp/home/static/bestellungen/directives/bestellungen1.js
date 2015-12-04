angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', function ($scope, bestellungenService, supplierService) {
            var controller = this;
            controller.list = bestellungenService.resource.query({'status': 1});
            controller.list.$promise.then(function (result) {
                supplier = supplierService.resource.query({'id': controller.list.supplierid});
                controller.list.supplierid = supplier;
            });
        }],
        controllerAs: 'bestellungen1'
    };
});
