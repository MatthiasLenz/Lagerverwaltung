angular.module('baseApp').
directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: ['$scope', '$http', 'bestellungenService', 'supplierService', function ($scope, $http, bestellungenService, supplierService) {
            var controller = this;
            controller.list = [];
            updateList();
            controller.files = {};
            window.scope1 = controller;
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
                    bestellungenService.purchasedocdata.update(doc.id, docdata);
                });
                delete controller.files[doc.id];
            };
            bestellungenService.purchasedoc.files().then(function (files) {
                //build a dictionary
                files.results.forEach(function (item) {
                    controller.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
                });

            });
            controller.make = function (doc, type) {
                bestellungenService.make(doc, type).then(function (docurl) {
                    //Todo: only reload the specific doc, not the list
                    bestellungenService.purchasedoc.files().then(function (files) {
                        files.results.forEach(function (item) {
                            controller.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
                        });
                    });
                });
            };
            controller.set_status_sent = function (doc) {
                bestellungenService.purchasedoc.update({id: doc.id}, {status: 1}).then(function (response) {
                    updateList();
                });
            };
            controller.delete_docdata = function (purchasedocid, id) {
                bestellungenService.purchasedocdata.delete(purchasedocid, id).then(function () {
                    updateList();
                });
            };
            controller.delete_documents = function (doc) {
                delete controller.files[doc.id];
                bestellungenService.purchasedoc.delete_documents(doc.id);
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

            //Todo change purchasedoc date
        }],
        controllerAs: 'bestellungen'
    };
});
