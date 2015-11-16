angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', 'bestellungenService', function ($http, $scope, bestellungenService) {
    // 1. Self-reference
    var controller = this;
    // 2. requirements
    // 3. Do scope stuff
    // 3a. Set up watchers on the scope.
    // 3b. Expose methods or data on the scope
    // 3c. Listen to events on the scope
    // 4. Expose methods and properties on the controller instance
    controller.product = $scope.bestellen.selectedprod;
    controller.suppliers = [];
    // 5. Clean up
    // 6. All the actual implementations go here
    controller.purchasedocs = bestellungenService.purchasedocs;
    controller.product.supplier.forEach(
        function (entry) {
            var suppdata = {};
            $http.get(entry).then(function (response) {
                //Get productsupplier data
                suppdata["default"] = controller.product.defaultsupplier == response.data.supplierid;
                suppdata["supplierid"] = response.data.supplierid;
                suppdata["comment"] = response.data.comment;
                suppdata["purchaseprice"] = response.data.purchaseprice;
                suppdata["opendoc"] = false;
                controller.purchasedocs.forEach(function (item) {
                    if (item.supplierid == response.data.supplierid) {
                        suppdata["opendoc"] = true;
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

}]);
