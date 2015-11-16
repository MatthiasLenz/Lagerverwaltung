angular.module('baseApp.bestellen').
controller('Step3Ctrl', ['$http', '$scope', 'bestellungenService', function ($http, $scope, bestellungenService) {
    var controller = this;
    window.step3 = $scope;
    controller.changeIn = changeIn;
    controller.product = $scope.bestellen.selectedprod;
    controller.packings = {"base": {"name": controller.product.unit1, "quantity": 1, "orderAmount": 0}};
    controller.purchasedocs = bestellungenService.purchasedocs;

    controller.product.packing.forEach(
        function (entry) {
            var packdata = {};
            var id;
            $http.get(entry).then(function (response) {
                //Get productpacking data
                packdata["name"] = response.data.name;
                packdata["quantity"] = response.data.quantity;
                packdata["orderAmount"] = 0;
                packdata["changed"] = false;
                id = response.data.packingid;
                controller.packings[id] = packdata;
            });
        });

    function changeIn(key1) {
        for (var key2 in controller.packings) {
            if (key1 != key2 && controller.packings[key1].orderAmount != 0) {
                controller.packings[key2].orderAmount = parseFloat(((controller.packings[key1].orderAmount * controller.packings[key1].quantity)
                / controller.packings[key2].quantity).toFixed(2));
            }
        }
    }

}]);
