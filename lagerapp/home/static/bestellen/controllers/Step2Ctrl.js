angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', '$q', '$interval', 'bestellungenService', '$log',
    function ($http, $scope, $q, $interval, bestellungenService, $log) {

    var controller = this;
    controller.product = $scope.bestellen.selectedprod;
    controller.suppliers = [];
    controller.purchasedocs = [];
    controller.loading = true;
    controller.no_suppliers = false;
    $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        $interval.cancel(dotIntervall);
    });
    function getPurchases() {
        return bestellungenService.list({status: 0});
    }

    var i = 0;
    var dots = ['', '.', '..', '...', '....'];
    var dotIntervall = $interval(function () {
        i = (i + 1) % dots.length;
        controller.dots = dots[i];
    }, 600);

    function getProductSupplier(entry) {
        return $http.get(entry);
    }
    var purchaseData = getPurchases();

    purchaseData.then(function (result) {
        result.forEach(function (item) {
            controller.purchasedocs.push(item);
        });
        var supplierPromises = [];
        var productSupplierPromises = [];
        controller.product.supplier.forEach(function (url) {
            var suppdata = {};
            var productSupplierData = getProductSupplier(url);
            productSupplierPromises.push(productSupplierData);
            productSupplierData.then(function (response) {
                //Get productsupplier data
                if (controller.product.defaultsupplier != null) {
                    suppdata["default"] = controller.product.defaultsupplier.url == response.data.supplierid.url;
                }
                else {
                    suppdata["default"] = false;
                }
                suppdata["supplierid"] = response.data.supplierid;

                suppdata["comment"] = response.data.comment;
                suppdata["purchaseprice"] = response.data.purchaseprice;
                controller.purchasedocs.forEach(function (item) {
                    if (item.supplierid == response.data.supplierid.id) {
                        suppdata["opendoc"] = item;
                    }
                });
                if (response.data.supplierid != null) {//workaround for bad entries in legacy database
                    var supplierData = response.data.supplierid;
                    //Get supplier data
                    suppdata["name"] = supplierData.namea + " " + supplierData.nameb;
                    suppdata["address"] = supplierData.address;
                    suppdata["zipcode"] = supplierData.zipcode;
                    suppdata["city"] = supplierData.city;
                    suppdata["phone"] = supplierData.phone;
                    controller.suppliers.push(suppdata);
                }
            });
        });
        //after loop through suppliers and creating productsupplier promises
        $q.all(productSupplierPromises).then(function () { //after all supplier promises are resolved
            //after all productsupplier promises are resolved
            controller.loading = false;
            $interval.cancel(dotIntervall);
            if (controller.suppliers.length == 0) {
                controller.no_suppliers = true;
                //sollte dieser übergeben werden, die fehlenden felder einfach nullen
            }
        });
    });

}]);
