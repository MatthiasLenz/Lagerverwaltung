angular.module('baseApp').
controller('BaseCtrl', ['$q', 'tokenService', 'loginService', 'sessionService', 'stockService', 'bestellungenService',
    'supplierService',
    function ($q, tokenService, loginService, sessionService, stockService, bestellungenService, supplierService) {
    var controller = this;
    controller.logininfo = loginService.data;
    controller.login = tokenService.getToken;
    controller.state = null;
    controller.setState = function (state) {
        best_init  = bestellungenService.init();
        supp_init  = supplierService.init();
        stock_init = stockService.init();
        //ensure that all services are initialized before setting state which loads the directive
        $q.all([best_init, supp_init, stock_init]).then(function(){
            controller.state = state;
        })
    };
    controller.setState('lagerausgang_state');
    controller.isActive = function (state) {
        return controller.state == state;
    };

    controller.dropdown = false;
    window.base = controller;
        stockService.stockinfo({})
            .then(function (data) {
                controller.stockinfo = data.results;
                controller.stockid = controller.stockinfo[0].id; //default
            });
        controller.setCompanyID = function (id) {
            var stockid = stockService.byCompany[id];
            sessionService.setCompany(id);
            sessionService.setStock(stockid);
        };
        controller.companies = ['01', '04', '05']; //Todo: retrieve ID's dynamically
        sessionService.getCompany().then(function(companyid){
            controller.companyid=companyid;
        });

        controller.stockIDChanged = function () {
            sessionService.publish();
        }
}]);
