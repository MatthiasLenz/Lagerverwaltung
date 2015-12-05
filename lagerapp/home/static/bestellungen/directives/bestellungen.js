angular.module('baseApp').
directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', function ($scope, bestellungenService, supplierService) {
            var controller = this;
            controller.list = [];
            controller.showDetail = {};

            bestellungenService.list({'status': 0}).then(function (result) {
                result.forEach(function (item) {
                    supplier = supplierService.resource.query({'id': item.supplierid});
                    item.supplier = supplier;
                    controller.list.push(item);
                    controller.showDetail[item.id] = false;
                });
            });

            controller.toggleDetail = function (id) {
                controller.showDetail[id] = !(controller.showDetail[id]);
            };
        }],
        controllerAs: 'bestellungen'
    };
});
