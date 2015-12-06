angular.module('baseApp').
directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', function ($scope, bestellungenService, supplierService) {
            var controller = this;
            controller.list = [];
            updateList();

            controller.delete_doc = function (doc) {
                bestellungenService.purchasedoc.delete(doc).then(function () {
                    updateList();
                });
            };
            controller.edit_doc = function (doc) {
                controller.list.forEach(function (item) {
                    item.edit = false;
                });
                doc.edit = true;
            };
            controller.save_doc = function (doc) {
                doc.edit = false;
                doc.data.forEach(function (docdata) {
                    docdata.amount = docdata.quantity * docdata.price;
                    bestellungenService.purchasedocdata.update({id: docdata.rowid}, docdata);
                });

            };
            controller.delete_docdata = function (id) {
                bestellungenService.purchasedocdata.delete(id).then(function () {
                    updateList();
                });
            };
            function updateList() {
                controller.list = [];
                bestellungenService.purchasedoc.list({'status': 0}).then(function (result) {
                    result.forEach(function (item) {
                        supplier = supplierService.resource.query({'id': item.supplierid});
                        item.supplier = supplier;
                        controller.list.push(item);
                    });
                });
            }
        }],
        controllerAs: 'bestellungen'
    };
});
