angular.module('baseApp.Services').factory("sessionService", function ($rootScope, tokenService, $http, $q) {
    var companyid = null;
    var stockid = null;      //default
    var user = null;
    var config = null;
    var setCompany = function (id) {
        companyid = id;
    };
    function init (){
        return get_config()
        .then(function (config_data){
            companyid = config_data.company.id;
        })
    }
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
    var get_config = function(){
        if (config) {
            //turn value into promise with $q.when(value)
            return $q.when(config);
        }
        return tokenService.getToken()
        .then(function (tokendata) {
            console.log("Config data loaded");
            return $http({
                method: 'GET',
                url: '/api/getconfig',
                dataType: 'json',
                headers: {
                    "Authorization": "Token " + tokendata.token,
                    "Content-Type": "application/json"
                }
            })
        })
        .then(function (response) {
            config = response.data;
            return response.data;
        })
        .catch(function (err) {
            alert("Error");
        });
    };

    var getStock = function () {
        return config.stockbyid[companyid];
    };
    //Maybe add get Token and get User here
    return {
        init: init,
        getConfig: get_config,
        setCompany: setCompany,
        getCompany: getCompany,
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
