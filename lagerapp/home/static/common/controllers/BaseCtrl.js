angular.module('baseApp').
controller('BaseCtrl', ['loginService', function (loginService) {
    // 1. Self-reference
    var controller = this;
    window.scope = controller;
    // 2. requirements
    // 3. Do scope stuff
    // 3a. Set up watchers on the scope.
    // 3b. Expose methods or data on the scope
    controller.logininfo = loginService.data;
    controller.login = loginService.login;
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
