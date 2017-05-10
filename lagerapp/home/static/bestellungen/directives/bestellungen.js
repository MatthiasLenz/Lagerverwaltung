angular.module('baseApp')
.controller('BestellungenCtrl', ['$scope', '$http', 'bestellungenService', 'supplierService', 'tokenService', 'sessionService', 'alertService', 'utilityService',
    function($scope, $http, bestellungenService, supplierService, tokenService, sessionService, alertService, utilityService) {
        var vm = this;
        vm.list = [];
        window.vm = vm;
        updateList();
        sessionService.subscribeStockIDChange($scope, function () {
            updateList();
        });
        vm.randomid = "";
        vm.select_doc = select_doc;
        function select_doc(doc) {
            vm.randomid = utilityService.randomid();
            var temp = doc.select;
            vm.list.forEach(function (item) {
                item.select = false;
            });
            doc.select = !temp;
            if (!doc.pdf){
                refresh_documents(doc);
            }
        }

        vm.delete_doc = function (doc) {
            bestellungenService.purchasedoc.delete(doc).then(function () {
                for (let i = 0; i<vm.list.length; i++){
                    let purchasedoc = vm.list[i];
                    if (doc.id === purchasedoc.id){
                        vm.list.splice(i, 1);
                    }
                }
            });
        };

        vm.edit_doc = function (doc) {
            var temp = doc.edit;
            vm.list.forEach(function (item) {
                item.edit = false;
            });
            doc.edit = !temp;
            vm.list.forEach(function (item) {
                item.select = false;
            });
            doc.select = true;
        };

        vm.save_doc = function (doc) {
            doc.edit = false;
            //if all updates are started at the same time, the tokenService might not have a token yet (if the
            //user did not log in) and it will prompt the login view for each update
            bestellungenService.purchasedocdata.batch_update(doc.data).then(function () {
                bestellungenService.purchasedoc.delete_documents(doc.id);
                refresh_documents(doc);
            });
        };

        vm.make = make;
        function make(doc, type) {
            return bestellungenService.make(doc, type).then( function(response){
                return response.data;
            });
        }

        vm.set_status_sent = function (doc) {
            bestellungenService.purchasedoc.update({id: doc.id}, {status: 2}).then(function (response) {
                updateList();
            });
        };

        vm.sendmail = sendmail;
        function sendmail(doc) {
            tokenService.getToken().then(function (tokendata) {
                $http({
                    method: 'POST',
                    url: '/api/sendmail/',
                    data: {purchasedoc: doc},
                    dataType: 'json',
                    headers: {
                        "Authorization": "Token "+tokendata.token,
                        "Content-Type": "application/json"
                    }
                })
                .then(function(response){
                    alertService.showAlert("Senden erfolgreich.");
                })
                .catch(function (error) {
                    alertService.showAlert("Senden fehlgeschlagen.");
                })
            })
        }

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
            return bestellungenService.purchasedoc.list({'status': 0}).then(function (result) {
                result.forEach(function (item) {
                    supplierService.get({id: item.supplierid}).then(function (response) {
                        item.supplier = response;
                    });
                    vm.list.push(item);
                });
                return result;
            })
        }

        vm.refresh_documents = refresh_documents;
        function refresh_documents(doc) {
            var docid = doc.id;
            vm.randomid = utilityService.randomid();
            //alte PDF entfernen und neue PDF erstellen
            doc.pdf = '';
            make(doc, 'pdf').then(function(pdf){
                doc.pdf = pdf;
                vm.list.forEach(function (item) {
                    //keep document selected after refresh
                    if (item.id === docid){
                        item.select = true;
                    }
                });
            });
        }
        //Todo change purchasedoc date
    }])
    .directive('bestellungen', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen.html',
        controller: 'BestellungenCtrl',
        controllerAs: 'bestellungen'
    };
});
