angular.module('baseApp').
controller('BaseCtrl', ['tokenService', 'loginService', 'sessionService', 'stockService', '$rootScope',
    function (tokenService, loginService, sessionService, stockService, $rootScope) {
    var controller = this;
    controller.logininfo = loginService.data;
    controller.login = tokenService.getToken;
    controller.state = 'productlist_state';
    controller.setState = function (state) {
        controller.state = state;
    };
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
        controller.companyid = sessionService.getCompany();

        controller.stockIDChanged = function () {
            sessionService.publish();
        }
}]);
