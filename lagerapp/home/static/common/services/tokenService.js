angular.module('baseApp.Services').
factory("tokenService", function ($http) {
    var token;

    function getToken() {
        if (!token) {
            // $http returns a promise, which has a then function, which also returns a promise
            token = $http.get('api/token/').then(function (response) {
                // The then function here is an opportunity to modify the response
                // The return value gets picked up by the then in the controller.
                return response.data;
            });
        }
        // Return the promise to the controller
        return token;
    };

    return {
        getToken: getToken
    };
});