angular.module('baseApp').
controller('BaseCtrl', ['$scope', '$uibModal', 'tokenService', function ($scope, $uibModal, tokenService) {
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

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'static/login.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                credentials: function () {
                    return $scope.credentials;
                }
            }
        });

        modalInstance.result.then(function (credentials) {
            tokenService.getToken(credentials);
        });
    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
angular.module('baseApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.ok = function () {
        $uibModalInstance.close($scope.credentials);
    };

});