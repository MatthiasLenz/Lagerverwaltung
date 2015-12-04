angular.module('baseApp.bestellen').
controller('Step3Ctrl', ['$http', '$scope', 'bestellungenService', 'tokenService', '$filter',
    function ($http, $scope, bestellungenService, tokenService, $filter) {
    var controller = this;
    controller.changeIn = changeIn;
    controller.toggleDetail = toggleDetail;
    controller.save = save;
    controller.showDetail = false;
    controller.showText = "Details ansehen »";
    controller.product = $scope.bestellen.selectedprod;
    controller.supplier = $scope.bestellen.selectedsupp;
    controller.packings = {"base": {"name": controller.product.unit1, "quantity": 1, "orderAmount": 0}};

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

    function toggleDetail() {
        if (controller.showDetail) {
            controller.showText = "Details ansehen »";
            controller.showDetail = false;
        }
        else {
            controller.showText = "« ausblenden";
            controller.showDetail = true;
        }
    }

    function save() {
        //if existing purchasedoc: create purchasedocdata with purchasedocid
        if (controller.supplier.opendoc) {
            var purchasedocid = controller.supplier.opendoc.id;
            tokenService.getToken().then(function (ts) {
                $http({
                    method: 'POST',
                    url: '/api/purchasedocdata/',
                    data: {
                        "purchasedocid": purchasedocid,
                        "prodid": controller.product.id,
                        "name": controller.product.name1,
                        "unit": controller.product.unit1,
                        "quantity": controller.packings['base'].orderAmount,
                        "price": controller.supplier.purchaseprice,
                        "amount": controller.packings['base'].orderAmount * controller.supplier.purchaseprice
                    },
                    headers: {"Authorization": "Token " + ts.token}
                });
            })
        }
        else {
            tokenService.getToken().then(function (ts) {
                bestellungenService.setToken(ts.token);
                bestellungenService.resource.create({
                        "responsible": ts.user,
                        "doctype": 2,
                        "module": 5,
                        "status": 0,
                        "supplierid": controller.supplier.supplierid.id, //das muss refactored werden
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
                        "data": [{
                            "prodid": controller.product.id,
                            "name": controller.product.name1,
                            "unit": controller.product.unit1,
                            "quantity": controller.packings['base'].orderAmount,
                            "price": controller.supplier.purchaseprice,
                            "amount": controller.packings['base'].orderAmount * controller.supplier.purchaseprice
                        }]
                });
            });
        }
        bestellungenService.clearCache();
    }
}]);
