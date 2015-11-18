angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', 'bestellungenService', function ($http, $scope, bestellungenService) {

    var controller = this;
    controller.product = $scope.bestellen.selectedprod;
    controller.suppliers = [];
    controller.purchasedocs = [];

    bestellungenService.resource.query().$promise.then(function (result) {

        result.forEach(function (item) {
            controller.purchasedocs.push(item);
        });

        controller.product.supplier.forEach(function (entry) {
            var suppdata = {};
            $http.get(entry).then(function (response) {
                //Get productsupplier data
                suppdata["default"] = controller.product.defaultsupplier.url == response.data.supplierid;
                suppdata["supplierid"] = response.data.supplierid;
                suppdata["comment"] = response.data.comment;
                suppdata["purchaseprice"] = response.data.purchaseprice;
                controller.purchasedocs.forEach(function (item) {
                    if (item.supplierid == response.data.supplierid) {
                        suppdata["opendoc"] = item;
                    }
                });
                $http.get(response.data.supplierid).then(function (response) {
                    //Get supplier data
                    suppdata["name"] = response.data.namea + " " + response.data.nameb;
                    suppdata["address"] = response.data.address;
                    suppdata["zipcode"] = response.data.zipcode;
                    suppdata["city"] = response.data.city;
                    suppdata["phone"] = response.data.phone;
                    controller.suppliers.push(suppdata);
                });
            });
        });
    });


}]);
