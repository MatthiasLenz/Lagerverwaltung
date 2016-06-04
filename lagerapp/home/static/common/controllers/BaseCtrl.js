angular.module('baseApp').controller('BaseCtrl', ['$q', '$location','$scope', 'tokenService',
    'sessionService', 'stockService', 'bestellungenService', 'supplierService',
    function ($q, $location, $scope, tokenService, sessionService, stockService, bestellungenService, supplierService) {
        $scope.$on("$locationChangeSuccess", function (event, newUrl, oldUrl) {
            $scope.successPath = $location.path();
            vm.setState($scope.successPath.substring(1));
        });
        var vm = this; //ViewModel
        vm.login = tokenService.getToken;
        vm.state = null;
        vm.setState = function (state) {
            sessionService.init().then(function(config_data){
                //only load config once
                best_init = bestellungenService.init();
                supp_init = supplierService.init();
                stock_init = stockService.init();
                $q.all([best_init, supp_init, stock_init]).then(function () {
                    //ensure that all services are initialized before setting state which loads the directive
                    vm.state = state;
                    $location.url(state);
                    sessionService.getConfig().then(function (response) {
                        vm.config_data = response;
                    });
                })
            });
        };
        vm.isActive = function (state) {
            return vm.state == state;
        };

        vm.dropdown = false;
        window.base = vm;
        vm.setCompanyID = function (id) {
            sessionService.setCompany(id);
        };
        sessionService.getCompany().then(function (companyid) {
            vm.companyid = companyid;
        });

        vm.stockIDChanged = function () {
            sessionService.publish();
        }
    }]);
