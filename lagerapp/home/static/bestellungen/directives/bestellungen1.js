angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', '$filter',
            function ($scope, bestellungenService, supplierService, $filter) {
                var vm = this;
                vm.select = null; //purchasedoc
                vm.list = [];
                vm.supplierid = '';
                vm.suppliers = [];
                vm.showDetail = {};
                vm.marked = "";
                vm.status = 1;
                var now = new Date();
                var mindate = new Date(now.setMonth(now.getMonth() - 6));
                get_suppliers();
                vm.open = function($event) {
                    vm.yearpickerOpened = true;
                };
                vm.update = function () {
                    updateList();
                };
                vm.set_status_open = set_status_open;
                function set_status_open(docid) {
                    bestellungenService.purchasedoc.update({id: docid}, {status: 0}).then(function (response) {
                        updateList();
                    });
                }
                vm.set_status_2 = function (doc) {
                    bestellungenService.purchasedoc.update({id: doc.id}, {"status": 2})
                };
                vm.delete_delnote = function (rowid) {
                    bestellungenService.deliverynote.delete(rowid).then(function (result) {
                        //reload
                        supplier = vm.select.supplier;
                        vm.select = result;
                        vm.select.supplier = supplier;
                    })
                };
                //Todo bestellungen des lieferanten zusammenfassen, lieferung
                // möglichst wenigen bestellungen zuordnen
                // entweder total angeben, von dem abgezogen wird
                // oder automatisch im hintergrund die gelieferte menge auf die bestellungen aufteilen, beginnend mit der
                // ältesten.
                // deliverynote.orderid               = purchasedoc.id
                // deliverynotedata.purchasedocdataid = purchasedocdata.dataid

                vm.new_edit_delnote = function () {
                    var data = {
                        "module": 5, "status": 1, "orderid": vm.select.id,
                        "supplierid": vm.select.supplierid,
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'), "data": []
                    };
                    vm.select.data.forEach(function (item) {
                        data.data.push({
                            "rowid": null, "prodid": item.prodid, "name": item.name, "unit": item.unit, "quantity": 0,
                            "price": item.price, "amount": 0
                        });
                    });
                    vm.edit_delnote = data;
                };
                vm.supplierByID = {};
                function get_suppliers() {
                    bestellungenService.purchasedoc.suppliers().then(function (result) {
                        result.forEach(function (item) {
                            vm.suppliers.push(item);
                            vm.supplierByID[item.id] = item;
                        });
                    });
                }
                vm.add_delnote = function () {
                    var data = {
                        "module": 5, "status": 1, "orderid": vm.select.id,
                        "supplierid": vm.select.supplierid,
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'), "data": []
                    };
                    vm.select.data.forEach(function (item) {
                        data.data.push({
                            "rowid": null, "prodid": item.prodid, "name": item.name, "unit": item.unit, "quantity": 0,
                            "price": item.price, "amount": 0
                        });
                    });
                    bestellungenService.deliverynote.create(data).then(function () {

                        bestellungenService.purchasedoc.get({id: vm.select.id}).then(function (result) {
                            //reload
                            supplier = vm.select.supplier;
                            vm.select = result;
                            vm.select.supplier = supplier;
                        });
                    });
                };

                vm.status_options = [
                    {id: 1, descr: "Verschickt"},
                    {id: 2, descr: "Lieferung hat begonnen"},
                    {id: 3, descr: "Lieferung wahrscheinlich abgeschlossen"}
                    //{id: 4, descr: "Abgeschlossen"}
                ];

                vm.mark = function (prodid) {
                    vm.marked = prodid;
                };
                vm.edit_doc = function (doc) {
                    var temp = doc.edit;
                    vm.list.forEach(function (item) {
                        item.edit = false;
                    });
                    doc.edit = !temp;
                };
                vm.delete_doc = function (doc) {
                    bestellungenService.purchasedoc.delete(doc).then(function () {
                        updateList();
                    });
                };

                function updateList() {
                    vm.list = [];
                    bestellungenService.purchasedoc.list({
                        'status': "2,3",
                        'supplierid': vm.supplierid,
                        'min_date': mindate.toISOString().slice(0,10)
                    }).then(function (result) {
                        result.forEach(function (item) {
                            supplier = vm.supplierByID[item.supplierid];
                            item.supplier = supplier;
                            vm.list.push(item);
                            vm.showDetail[item.id] = false;
                        });
                    });

                }

                vm.toggleDetail = function (id) {
                    vm.showDetail[id] = !(vm.showDetail[id]);
                };
            }],
        controllerAs: 'bestellungen1'
    };
});
