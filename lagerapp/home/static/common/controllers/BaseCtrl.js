angular.module('baseApp').
controller('BaseCtrl', ['$scope', function ($scope) {
    // 1. Self-reference
    var controller = this;
    // 2. requirements
    // 3. Do scope stuff
    // 3a. Set up watchers on the scope.
    // 3b. Expose methods or data on the scope
    controller.state = 'productlist_state';
    controller.setState = function (state) {
        controller.state = state;
    };
    controller.isActive = function (state) {
        return controller.state == state;
    };
    controller.dropdown = false;
    window.base = controller;
    // 3c. Listen to events on the scope
    // 4. Expose methods and properties on the controller instance
    // 5. Clean up
    // 6. All the actual implementations go here.
}]);
