angular.module('baseApp').
directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: ['$scope', '$http', 'bestellungenService', 'supplierService', 'tokenService', 'sessionService',
            function ($scope, $http, bestellungenService, supplierService, tokenService, sessionService) {
            var controller = this;
            controller.list = [];
            updateList();
            controller.files = {};
                sessionService.subscribeStockIDChange($scope, function () {
                    updateList();
                });
            controller.delete_doc = function (doc) {
                bestellungenService.purchasedoc.delete(doc).then(function () {
                    //updateList();
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
                //if all updates are started at the same time, the tokenService might not have a token yet (if the
                //user did not log in) and it will prompt the login view for each update
                bestellungenService.purchasedocdata.batch_update(doc.data).then(function () {
                    bestellungenService.purchasedoc.delete_documents(doc.id);
                    delete controller.files[doc.id];
                });
            };

            bestellungenService.purchasedoc.files().then(function (files) {
                //build a dictionary
                files.results.forEach(function (item) {
                    controller.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
                });

            });

            controller.make = function (doc, type) {
                bestellungenService.make(doc, type).then(function (docurl) {
                    bestellungenService.purchasedoc.file(doc.id).then(function (item) {
                            controller.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
                    });
                });
            };

            controller.set_status_sent = function (doc) {
                bestellungenService.purchasedoc.update({id: doc.id}, {status: 2}).then(function (response) {
                    updateList();
                });
            };
            controller.delete_docdata = function (id) {
                bestellungenService.purchasedocdata.delete(id).then(function () {
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
                        supplierService.get({id: item.supplierid}).then(function (response) {
                            item.supplier = response;
                        });
                        controller.list.push(item);
                    });
                });
            }

            //Todo change purchasedoc date
        }],
        controllerAs: 'bestellungen'
    };
});
