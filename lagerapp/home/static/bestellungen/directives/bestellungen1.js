angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', '$filter',
            function ($scope, bestellungenService, supplierService, $filter) {
            var controller = this;
                controller.select = null; //purchasedoc
            controller.list = [];
            controller.showDetail = {};
            controller.marked = "";
            controller.status = 1;
            updateList();
                controller.update_status = function () {
                    updateList();
                };
                controller.set_status_2 = function (doc) {
                    bestellungenService.purchasedoc.update({id: doc.id}, {"status": 2})
                };
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
                    bestellungenService.deliverynote.create(data)
                };
            controller.status_options = [
                {id: 1, descr: "Verschickt"},
                {id: 2, descr: "Lieferung hat begonnen"},
                {id: 3, descr: "Lieferung wahrscheinlich abgeschlossen"},
                {id: 4, descr: "Abgeschlossen"}
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
                bestellungenService.purchasedoc.list({'status': controller.status}).then(function (result) {
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
