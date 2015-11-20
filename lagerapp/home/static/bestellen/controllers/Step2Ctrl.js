angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', '$q', '$interval', 'bestellungenService', function ($http, $scope, $q, $interval, bestellungenService) {

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
        return bestellungenService.resource.query().$promise;
    }

    var i = 0;
    var dots = ['', '.', '..', '...'];
    var dotIntervall = $interval(function () {
        i = (i + 1) % dots.length;
        controller.dots = dots[i];
    }, 400);
    function getSupplier(supplierid) {
        return $http.get(supplierid);
    }

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
                    suppdata["default"] = controller.product.defaultsupplier.url == response.data.supplierid;
                }
                else {
                    suppdata["default"] = false;
                }
                suppdata["supplierid"] = response.data.supplierid;
                suppdata["comment"] = response.data.comment;
                suppdata["purchaseprice"] = response.data.purchaseprice;
                controller.purchasedocs.forEach(function (item) {
                    if (item.supplierid == response.data.supplierid) {
                        suppdata["opendoc"] = item;
                    }
                });
                var supplierData = getSupplier(response.data.supplierid);
                supplierPromises.push(supplierData);
                supplierData.then(function (response) {
                    //Get supplier data
                    suppdata["name"] = response.data.namea + " " + response.data.nameb;
                    suppdata["address"] = response.data.address;
                    suppdata["zipcode"] = response.data.zipcode;
                    suppdata["city"] = response.data.city;
                    suppdata["phone"] = response.data.phone;
                    controller.suppliers.push(suppdata);
                }, function (error) {
                });
            });
        });
        //after loop through suppliers and creating productsupplier promises
        $q.all(productSupplierPromises).then(function () { //after all supplier promises are resolved
            //after all productsupplier promises are resolved and supplier promises are created
            $q.all(supplierPromises).then(function (success) {
                //after supplier promises are resolved
                controller.loading = false;
                $interval.cancel(dotIntervall);
                if (controller.suppliers.length == 0) {
                    controller.no_suppliers = true;
                }
            }, function (error) {
                controller.loading = false;
                $interval.cancel(dotIntervall);
                if (controller.suppliers.length == 0) {
                    controller.no_suppliers = true;
                }
            });
        });
    });

}]);
