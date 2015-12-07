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
                var temp = doc.edit;
                controller.list.forEach(function (item) {
                    item.edit = false;
                });
                doc.edit = !temp;
            };
            controller.save_doc = function (doc) {
                doc.edit = false;
                doc.data.forEach(function (docdata) {
                    docdata.amount = docdata.quantity * docdata.price;
                    bestellungenService.purchasedocdata.update({id: docdata.rowid}, docdata);
                });
            };
            controller.set_status_sent = function (doc) {
                bestellungenService.purchasedoc.update({id: doc.id}, {status: 1}).then(function (response) {
                    updateList();
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
