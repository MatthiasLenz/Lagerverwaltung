angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', function ($scope, bestellungenService, supplierService) {
            var controller = this;
            controller.list = [];
            updateList();
            controller.showDetail = {};
            controller.marked = "";
            controller.select = null;
            controller.mark = function (prodid) {
                controller.marked = prodid;
            };
            controller.edit_doc = function (doc) {
                var temp = doc.edit;
                controller.list.forEach(function (item) {
                    item.edit = false;
                });
                doc.edit = !temp;
            };
            controller.delete_doc = function (doc) {
                bestellungenService.purchasedoc.delete(doc).then(function () {
                    updateList();
                });
            };
            function updateList() {
                controller.list = [];
                bestellungenService.purchasedoc.list({'status': 1}).then(function (result) {
                    result.forEach(function (item) {
                        supplier = supplierService.resource.query({'id': item.supplierid});
                        item.supplier = supplier;
                        controller.list.push(item);
                        controller.showDetail[item.id] = false;
                    });
                });
                //ToDo refactoring, doppelter code
                bestellungenService.purchasedoc.list({'status': 2}).then(function (result) {
                    result.forEach(function (item) {
                        supplier = supplierService.resource.query({'id': item.supplierid});
                        item.supplier = supplier;
                        controller.list.push(item);
                        controller.showDetail[item.id] = false;
                    });
                });
            }

            controller.toggleDetail = function (id) {
                controller.showDetail[id] = !(controller.showDetail[id]);
            };
        }],
        controllerAs: 'bestellungen1'
    };
});
