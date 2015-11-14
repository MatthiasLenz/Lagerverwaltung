angular.module('baseApp.bestellen').
controller('Step2Ctrl', ['$http', '$scope', function ($http, $scope) {
    // 1. Self-reference
    var controller = this;
    // 2. requirements
    // 3. Do scope stuff
    // 3a. Set up watchers on the scope.
    // 3b. Expose methods or data on the scope
    // 3c. Listen to events on the scope
    // 4. Expose methods and properties on the controller instance
    controller.product = $scope.bestellen.selected;
    controller.suppliers = [];
    // 5. Clean up
    // 6. All the actual implementations go here
    controller.product.supplier.forEach(
        function (entry) {
            $http.get(entry).then(function (response) {
                controller.suppliers.push(response.data);
            });
        }
    );

}]);
