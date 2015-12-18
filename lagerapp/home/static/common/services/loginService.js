angular.module('baseApp.Services').
factory("loginService", function ($uibModal) {
    var data = {user: "", loggedin: false};
    var login = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'static/login.html',
            controller: 'LoginInstanceCtrl',
            resolve: {
                //credentials: function () {
                //    return $scope.credentials;
                //}
            }
        });
        modalInstance.result.then(function (username) {
            data.loggedin = true;
            data.user = username;
        });
    };
    return {
        login: login,
        data: data
    };
});
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
angular.module('baseApp').controller('LoginInstanceCtrl', function ($scope, $uibModalInstance, tokenService) {
    $scope.error = false;
    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.ok = function () {
        tokenService.getToken($scope.credentials).then(function (tokendata) {
            $uibModalInstance.close($scope.credentials.username);
        }, function (error) {
            $scope.error = true;
        });
    };

});