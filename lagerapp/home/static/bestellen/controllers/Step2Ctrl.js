angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', '$q', 'bestellungenService', '$log','utilityService',
    function ($http, $scope, $q, bestellungenService, $log, utilityService) {

    var vm = this;
    vm.product = $scope.bestellen.selectedprod;
    vm.suppliers = [];
    vm.purchasedocs = [];
    vm.loading = true;
    vm.no_suppliers = false;
    vm.dots = utilityService.dots;
    function getPurchases() {
        return bestellungenService.purchasedoc.list({status: 0});
    }

    function getProductSupplier(entry) {
        return $http.get(entry);
    }
    var purchaseData = getPurchases();

    purchaseData.then(function (result) {
        result.forEach(function (item) {
            vm.purchasedocs.push(item);
        });
        console.log("get psupp");
        var supplierPromises = [];

        bestellungenService.get_productsupplier(vm.product.id)
        .then(function(response){
            let suppliers = response.results;
            suppliers.forEach(function (supplier) {
                var suppdata = {};
                //Get productsupplier data
                if (vm.product.defaultsupplier !== null) {
                    suppdata["default"] = vm.product.defaultsupplier.url === supplier.supplierid.url;
                }
                else {
                    suppdata["default"] = false;
                }
                suppdata["supplierid"] = supplier.supplierid;

                suppdata["comment"] = supplier.comment;
                suppdata["purchaseprice"] = supplier.purchaseprice;
                vm.purchasedocs.forEach(function (item) {
                    if (item.supplierid === supplier.supplierid.id) {
                        suppdata["opendoc"] = item;
                    }
                });
                if (supplier.supplierid !== null) {//workaround for bad entries in legacy database
                    var supplierData = supplier.supplierid;
                    //Get supplier data
                    suppdata["name"] = supplierData.namea + " " + supplierData.nameb;
                    suppdata["address"] = supplierData.address;
                    suppdata["zipcode"] = supplierData.zipcode;
                    suppdata["city"] = supplierData.city;
                    suppdata["phone"] = supplierData.phone;
                    vm.suppliers.push(suppdata);
                }
            });
            return response;
        })
        .then(function () {
            vm.loading = false;
            if (vm.suppliers.length === 0) {
                vm.no_suppliers = true;
                //sollte dieser übergeben werden, die fehlenden felder einfach nullen
            }
        });
    });

}]);
