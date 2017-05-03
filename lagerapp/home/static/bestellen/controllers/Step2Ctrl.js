angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', '$q', '$interval', 'bestellungenService', '$log',
    function ($http, $scope, $q, $interval, bestellungenService, $log) {

    var vm = this;
    vm.product = $scope.bestellen.selectedprod;
    vm.suppliers = [];
    vm.purchasedocs = [];
    vm.loading = true;
    vm.no_suppliers = false;
    $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        $interval.cancel(dotIntervall);
    });
    function getPurchases() {
        return bestellungenService.purchasedoc.list({status: 0});
    }

    var i = 0;
    var dots = ['', '.', '..', '...', '....'];
    var dotIntervall = $interval(function () {
        i = (i + 1) % dots.length;
        vm.dots = dots[i];
    }, 600);

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
        var productSupplierPromises = [];

        bestellungenService.get_productsupplier(vm.product.id).then(function(response){
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
        });

        //after loop through suppliers and creating productsupplier promises
        $q.all(productSupplierPromises).then(function () { //after all supplier promises are resolved
            //after all productsupplier promises are resolved
            vm.loading = false;
            $interval.cancel(dotIntervall);
            if (vm.suppliers.length == 0) {
                vm.no_suppliers = true;
                //sollte dieser übergeben werden, die fehlenden felder einfach nullen
            }
        });
    });

}]);
