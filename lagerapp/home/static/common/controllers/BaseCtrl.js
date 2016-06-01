angular.module('baseApp').controller('BaseCtrl', ['$q', 'tokenService', 'loginService', 'sessionService', 'stockService', 'bestellungenService',
    'supplierService',
    function ($q, tokenService, loginService, sessionService, stockService, bestellungenService, supplierService) {
        var vm = this; //ViewModel
        vm.logininfo = loginService.data;
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
                    sessionService.getConfig().then(function (response) {
                        vm.config_data = response;
                    });
                })
            });

        };

        vm.setState('lagerausgang_state');
        vm.isActive = function (state) {
            return vm.state == state;
        };

        vm.dropdown = false;
        window.base = vm;
        stockService.stockinfo({})
            .then(function (data) {
                vm.stockinfo = data.results;
                vm.stockid = vm.stockinfo[0].id; //default
            });
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
