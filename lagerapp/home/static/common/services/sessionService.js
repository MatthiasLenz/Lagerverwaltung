angular.module('baseApp.Services').factory("sessionService", function ($rootScope, tokenService, $http, $q) {
    var companyid = null;
    var stockid = '0';      //default
    var user = null;
    var setCompany = function (id) {
        companyid = id;
    };
    var getCompany = function () {
        if (companyid) {
            //turn value into promise with $q.when(value)
            return $q.when(companyid);
        }
        else {
            return tokenService.getToken()
                .then(function (tokendata) {
                    return $http({
                        method: 'GET',
                        url: '/api/whoami',
                        dataType: 'json',
                        headers: {
                            "Authorization": "Token " + tokendata.token,
                            "Content-Type": "application/json"
                        }
                    })
                })
                .then(function (response) {
                    companyid = response.data.companyid;
                    return response.data.companyid;
                })
                .catch(function (err) {
                    alert("Error");
                });
        }
    };

    var setStock = function (id) {
        stockid = id;
    };
    var getStock = function () {
        return stockid;
    };
    //Maybe add get Token and get User here
    return {
        setCompany: setCompany,
        getCompany: getCompany,
        setStock: setStock,
        getStock: getStock,
        subscribeStockIDChange: function (scope, callback) {
            var handler = $rootScope.$on('stock-change-event', callback);
            scope.$on('$destroy', handler);
            return handler; // return the unsubscribe function to the client
        },
        publish: function () {
            $rootScope.$emit('stock-change-event');
        }
    };
});
