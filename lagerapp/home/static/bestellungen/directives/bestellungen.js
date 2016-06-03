angular.module('baseApp').
directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: ['$scope', '$http', 'bestellungenService', 'supplierService', 'tokenService', 'sessionService',
            function ($scope, $http, bestellungenService, supplierService, tokenService, sessionService) {
            var vm = this;
            vm.list = [];
            updateList();
            vm.files = {};
            sessionService.subscribeStockIDChange($scope, function () {
                updateList();
            });
            vm.delete_doc = function (doc) {
                bestellungenService.purchasedoc.delete(doc).then(function () {
                    //updateList();
                });
            };
            vm.edit_doc = function (doc) {
                var temp = doc.edit;
                vm.list.forEach(function (item) {
                    item.edit = false;
                });
                doc.edit = !temp;
            };
            vm.save_doc = function (doc) {
                doc.edit = false;
                //if all updates are started at the same time, the tokenService might not have a token yet (if the
                //user did not log in) and it will prompt the login view for each update
                bestellungenService.purchasedocdata.batch_update(doc.data).then(function () {
                    bestellungenService.purchasedoc.delete_documents(doc.id);
                    delete vm.files[doc.id];
                });
            };

            bestellungenService.purchasedoc.files().then(function (files) {
                //build a dictionary
                files.forEach(function (item) {
                    vm.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
                });
            });

            vm.make = function (doc, type) {
                bestellungenService.make(doc, type).then(function (docurl) {
                    bestellungenService.purchasedoc.file(doc.id).then(function (item) {
                            vm.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
                    });
                });
            };

            vm.set_status_sent = function (doc) {
                bestellungenService.purchasedoc.update({id: doc.id}, {status: 2}).then(function (response) {
                    updateList();
                });
            };
            vm.sendmail = function(doc) {
                tokenService.getToken().then(function (tokendata) {
                    $http({
                        method: 'POST',
                        url: '/api/sendmail/',
                        data: {purchasedocid: doc.id},
                        dataType: 'json',
                        headers: {
                            "Authorization": "Token "+tokendata.token,
                            "Content-Type": "application/json"
                        }
                    })
                });
            };
            vm.delete_docdata = function (id) {
                bestellungenService.purchasedocdata.delete(id).then(function () {
                    updateList();
                });
            };
            vm.delete_documents = function (doc) {
                delete vm.files[doc.id];
                bestellungenService.purchasedoc.delete_documents(doc.id);
            };
            function updateList() {
                vm.list = [];
                bestellungenService.purchasedoc.list({'status': 0}).then(function (result) {
                    result.forEach(function (item) {
                        supplierService.get({id: item.supplierid}).then(function (response) {
                            item.supplier = response;
                        });
                        vm.list.push(item);
                    });
                });
            }

            //Todo change purchasedoc date
        }],
        controllerAs: 'bestellungen'
    };
});
