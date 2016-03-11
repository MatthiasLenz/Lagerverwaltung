angular.module('baseApp.Services').
factory("sessionService", function () {
    var companyid = '01';   //default
    var stockid = '0';      //default
    var setCompany = function (id) {
        companyid = id;
    };
    var getCompany = function () {
        return companyid;
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
        getStock: getStock
    };
});
