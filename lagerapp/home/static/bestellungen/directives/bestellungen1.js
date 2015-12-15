angular.module('baseApp').
directive('bestellungen1', function () {
    return {
        templateUrl: 'static/bestellungen/directives/bestellungen1.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', function ($scope, bestellungenService, supplierService) {
            var controller = this;
            controller.list = [];
            controller.showDetail = {};
            controller.marked = "";
            controller.status = 1;
            updateList();
            controller.status_options = [
                {id: 1, descr: "Verschickt"},
                {id: 2, descr: "Lieferung hat begonnen"},
                {id: 3, descr: "Lieferung wahrscheinlich abgeschlossen"},
                {id: 4, descr: "Abgeschlossen"}
            ];
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
            $scope.$watch('[bestellungen1.status]', function () {
                updateList();
            });
        }],
        controllerAs: 'bestellungen1'
    };
});
