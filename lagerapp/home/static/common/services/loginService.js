angular.module('baseApp.Services').
factory("loginService", function ($uibModal) {
    var modalInstance = null;
    var data = {user: "", loggedin: false};
    var login = function () {
        if (login.running){
            return modalInstance.result; //login has already been called (from a different location) and is running,
                                        // return  the existing promise;
        }
        modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'static/login.html',
            controller: 'LoginInstanceCtrl',
            resolve: {}
        });
        modalInstance.result.then(function (tokendata) {
            data.user = tokendata.user;
            data.loggedin = true;
            login.running = false;
        });
        login.running = true;
        //return a promise
        return modalInstance.result;
    };
    return {
        login: login,
        data: data
    };
});
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
angular.module('baseApp').controller('LoginInstanceCtrl', function ($scope, $uibModalInstance, $http) {
    $scope.error = false;
    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.ok = function () {
        $http.post('api/api-token-auth/', $scope.credentials).then(function (response) {
            return {token: response.data.token, user: $scope.credentials.username};
        }).then(function (tokendata) {
            $uibModalInstance.close(tokendata);
        }, function (error) {
            $scope.error = true;
        });

        /*tokenService.getToken($scope.credentials).then(function (tokendata) {
            $uibModalInstance.close($scope.credentials.username);
        }, function (error) {
            $scope.error = true;
         });*/
    };

});