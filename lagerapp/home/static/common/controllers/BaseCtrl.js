angular.module('baseApp').
controller('BaseCtrl', ['tokenService', 'loginService', function (tokenService, loginService) {
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

}]);
