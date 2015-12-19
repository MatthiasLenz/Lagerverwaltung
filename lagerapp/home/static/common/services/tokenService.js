angular.module('baseApp.Services').
factory("tokenService", function ($q, loginService) {
    var token;

    function getToken() {
        if (token) {
            //turn value into promise with $q.when(value)
            return $q.when(token);
        }
        else {
            //ToDo: split into two functions and init a login here
            return loginService.login().then(function (tokendata) {
                token = tokendata;
                return token;
            });
        }
    }

    return {
        getToken: getToken
    };
});