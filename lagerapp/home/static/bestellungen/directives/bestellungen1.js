angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', '$filter',
            function ($scope, bestellungenService, supplierService, $filter) {
                var controller = this;
                controller.select = null; //purchasedoc
                controller.list = [];
                controller.supplierid = '';
                controller.suppliers = [];
                controller.showDetail = {};
                controller.marked = "";
                controller.status = 1;
                window.scope11 = controller;
                get_suppliers();

                controller.update = function () {
                    updateList();
                };
                controller.set_status_2 = function (doc) {
                    bestellungenService.purchasedoc.update({id: doc.id}, {"status": 2})
                };
                controller.delete_delnote = function (rowid) {
                    bestellungenService.deliverynote.delete(rowid).then(function (result) {
                        //reload
                        supplier = controller.select.supplier;
                        controller.select = result;
                        controller.select.supplier = supplier;
                    })
                };
                //Todo bestellungen des lieferanten zusammenfassen, lieferung
                // möglichst wenigen bestellungen zuordnen
                // entweder total angeben, von dem abgezogen wird
                // oder automatisch im hintergrund die gelieferte menge auf die bestellungen aufteilen, beginnend mit der
                // ältesten.
                // deliverynote.orderid               = purchasedoc.id
                // deliverynotedata.purchasedocdataid = purchasedocdata.dataid

                controller.new_edit_delnote = function () {
                    var data = {
                        "module": 5, "status": 1, "orderid": controller.select.id,
                        "supplierid": controller.select.supplierid,
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'), "data": []
                    };
                    controller.select.data.forEach(function (item) {
                        data.data.push({
                            "rowid": null, "prodid": item.prodid, "name": item.name, "unit": item.unit, "quantity": 0,
                            "price": item.price, "amount": 0
                        });
                    });
                    controller.edit_delnote = data;
                };
                controller.supplierByID = {};
                function get_suppliers() {
                    bestellungenService.purchasedoc.suppliers().then(function (result) {
                        result.forEach(function (item) {
                            controller.suppliers.push(item);
                            controller.supplierByID[item.id] = item;
                        });
                    });
                }
                controller.add_delnote = function () {
                    var data = {
                        "module": 5, "status": 1, "orderid": controller.select.id,
                        "supplierid": controller.select.supplierid,
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'), "data": []
                    };
                    controller.select.data.forEach(function (item) {
                        data.data.push({
                            "rowid": null, "prodid": item.prodid, "name": item.name, "unit": item.unit, "quantity": 0,
                            "price": item.price, "amount": 0
                        });
                    });
                    bestellungenService.deliverynote.create(data).then(function () {

                        bestellungenService.purchasedoc.get({id: controller.select.id}).then(function (result) {
                            //reload
                            supplier = controller.select.supplier;
                            controller.select = result;
                            controller.select.supplier = supplier;
                        });
                    });
                };

                controller.status_options = [
                    {id: 1, descr: "Verschickt"},
                    {id: 2, descr: "Lieferung hat begonnen"},
                    {id: 3, descr: "Lieferung wahrscheinlich abgeschlossen"}
                    //{id: 4, descr: "Abgeschlossen"}
                ];

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
                    bestellungenService.purchasedoc.list({
                        'status': controller.status,
                        'supplierid': controller.supplierid
                    }).then(function (result) {
                        result.forEach(function (item) {
                            supplier = controller.supplierByID[item.supplierid];
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
