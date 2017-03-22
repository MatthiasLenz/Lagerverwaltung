angular.module('baseApp.Services').
factory("tokenService", function ($q, loginService, $cookies, $window) {
    var token;
    function deleteCookie(){
        $cookies.remove("tokendata");
        $window.location.reload();
    }
    function getToken() {
        if (token) {
            //turn value into promise with $q.when(value)
            return $q.when(token);
        }
        else if ($cookies.getObject("tokendata") ){
            return $q.when($cookies.getObject("tokendata"));
        }
        else {
            return loginService.login().then(function (tokendata) {
                token = tokendata;
                $cookies.putObject("tokendata", token);
                return token;
            });
        }
    }

    return {
        getToken: getToken,
        deleteCookie: deleteCookie
    };
});