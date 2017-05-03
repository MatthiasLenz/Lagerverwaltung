angular.module('baseApp').controller('BaseCtrl', ['$q', '$location','$scope', 'tokenService',
    'sessionService', 'stockService', 'bestellungenService', 'supplierService', 'installationService',
    function ($q, $location, $scope, tokenService, sessionService, stockService, bestellungenService, supplierService, installationService) {
        $scope.$on("$locationChangeSuccess", function (event, newUrl, oldUrl) {
            $scope.successPath = $location.path();
            vm.setState($scope.successPath.substring(1));
            console.log("das ist die fehlerquelle "+ newUrl + " " + oldUrl);
        });
        var vm = this; //ViewModel
        vm.login = tokenService.getToken;
        vm.logout = tokenService.deleteCookie;
        vm.state = null;
        vm.config_data = {};
        vm.modules = {Bestellen:false, Lagerausgang:false, Projektbestellung:false, Kleinmaschinen:false, Lagerausgang1: true};
        vm.setState = function (state) {
            sessionService.init().then(function(response){
                //only load config once
                best_init = bestellungenService.init();
                supp_init = supplierService.init();
                stock_init = stockService.init();
                inst_init = installationService.init();
                $q.all([best_init, supp_init, stock_init, inst_init]).then(function () {
                    //ensure that all services are initialized before setting  state which loads the directive
                    sessionService.getConfig().then(function (config_data) {
                        vm.config_data = config_data;
                        var groups = config_data.userdata['groups'];

                        if (groups.indexOf('Bestellen')!=-1) vm.modules.Bestellen = true;
                        if (groups.indexOf('Lagerausgang')!=-1) vm.modules.Lagerausgang = true;
                        if (groups.indexOf('Kleinmaschinen')!=-1) vm.modules.Kleinmaschinen = true;
                        if (state==''){
                            //initial state
                            if (vm.modules.Bestellen) state = 'productlist_state';
                            else if (vm.modules.Lagerausgang) state = 'lagerausgang_state';
                        }
                        switch (state){
                            case 'productlist_state':  if(vm.modules.Bestellen)  vm.state = state; break;
                            case 'purchasedoc0_state': if(vm.modules.Bestellen)  vm.state = state; break;
                            case 'purchasedoc1_state': if(vm.modules.Bestellen)  vm.state = state; break;
                            case 'purchasedoc2_state': if(vm.modules.Bestellen)  vm.state = state; break;
                            case 'lagerausgang_state': if(vm.modules.Lagerausgang)  vm.state = state; break;
                            default: vm.state=state;break;
                        }
                        $location.url(vm.state);
                    });
                });
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
        };
        vm.hasGroup = function(modulename){
            alert(vm.config_data.userdata['groups'].indexOf(modulename));
        };
    }]);
