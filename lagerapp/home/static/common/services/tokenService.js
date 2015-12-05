angular.module('baseApp.Services').
factory("tokenService", function ($http, $q) {
    var token;

    function getToken() {
        if (token) {
            //turn value into promise with $q.when(value)
            return $q.when(token);
        }
        else {
            return $http.get('api/token/').then(function (response) {
                // The then function here is an opportunity to modify the response
                // The return value gets picked up by the then in the controller.
                return response.data;
            });
        }
    }

    return {
        getToken: getToken
    };
});