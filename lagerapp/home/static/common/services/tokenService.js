angular.module('baseApp.Services').
factory("tokenService", function ($http, $q) {
    var token;

    function getToken(credentials) {
        if (token) {
            //turn value into promise with $q.when(value)
            return $q.when(token);
        }
        else {
            return $http.post('api/api-token-auth/', credentials).then(function (response) {
                // The then function here is an opportunity to modify the response
                // The return value gets picked up by the then in the controller.
                token = {token: response.data.token, user: credentials.username};
                return response.data;
            });
        }
    }

    return {
        getToken: getToken
    };
});