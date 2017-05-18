angular.module('baseApp.bestellen').
controller('Step3Ctrl', ['$http', '$scope', 'bestellungenService', 'tokenService', '$filter', 'loginService',
    function ($http, $scope, bestellungenService, tokenService, $filter, loginService) {
    var vm = this;
    window.vm = vm;
    vm.changeIn = changeIn;
    vm.toggleDetail = toggleDetail;
    vm.save = save;
    vm.showDetail = true;
    vm.showText = "Details ansehen »";
    vm.product = $scope.bestellen.selectedprod;
    vm.supplier = $scope.bestellen.selectedsupp;
        vm.packings = {"base": {"name": vm.product.unit1, "quantity": 1}};
        vm.selectedpacking = "";
    vm.product.packing.forEach(
        function (entry) {
            var packdata = {};
            var id;
            $http.get(entry).then(function (response) {
                //Get productpacking data
                packdata["name"] = response.data.name;
                packdata["quantity"] = response.data.quantity;
                packdata["changed"] = false;
                id = response.data.packingid;
                vm.packings[id] = packdata;
            });
        });

    function changeIn(key1) {
        for (var key2 in vm.packings) {
            if (key1 != key2) {
                vm.packings[key2].orderAmount = parseFloat(((vm.packings[key1].orderAmount * vm.packings[key1].quantity)
                / vm.packings[key2].quantity).toFixed(2));
            }
        }
        vm.selectedpacking = vm.packings[key1];
    }

    function toggleDetail() {
        if (vm.showDetail) {
            vm.showText = "Details ansehen »";
            vm.showDetail = false;
        }
        else {
            vm.showText = "« ausblenden";
            vm.showDetail = true;
        }
    }

    function save() {
        //if existing purchasedoc: create purchasedocdata with purchasedocid
        packing = "";
        if (vm.selectedpacking.name != vm.packings['base'].name) {
            packing = vm.selectedpacking.orderAmount + ' ' + vm.selectedpacking.name;
        }
        if (vm.supplier.opendoc) {
            var purchasedocid = vm.supplier.opendoc.id;
            data = {
                "rowid": null,
                "purchasedocid": purchasedocid, "prodid": vm.product.id, "name": vm.product.name1,
                "unit": vm.product.unit1, "quantity": vm.packings['base'].orderAmount,
                "price": vm.supplier.purchaseprice,
                "amount": vm.packings['base'].orderAmount * vm.supplier.purchaseprice,
                "packing": packing
            };
            bestellungenService.purchasedocdata.create(purchasedocid, data).then(function (response) {
                bestellungenService.purchasedoc.delete_documents(purchasedocid);
                $scope.bestellen.finish();
            }, function (error) {
                loginService.login();
            });
        }
        else {
            data = {
                "doctype": 2, "module": 5, "status": 0,
                "supplierid": vm.supplier.supplierid.id, //das muss refactored werden
                "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
                "data": [{
                    "rowid": null,
                    "prodid": vm.product.id, "name": vm.product.name1, "unit": vm.product.unit1,
                    "quantity": vm.packings['base'].orderAmount, "price": vm.supplier.purchaseprice,
                    "amount": vm.packings['base'].orderAmount * vm.supplier.purchaseprice,
                    "packing": packing
                }],
                "deliverynotes": []
            };
            bestellungenService.purchasedoc.create(data).then(function (response) {
                $scope.bestellen.finish();
            });
        }
    }
    }]);
