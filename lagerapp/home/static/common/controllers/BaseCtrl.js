angular.module('baseApp').
controller('BaseCtrl', ['$scope', '$uibModal', function ($scope, $uibModal) {
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
    $scope.items = ['item1', 'item2', 'item3'];

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'static/login.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
angular.module('baseApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});