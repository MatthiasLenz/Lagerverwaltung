angular.module('baseApp.Services').
factory("sessionService", function () {
    var companyid = '0'; //default
    var setCompany = function (id) {
        companyid = id;
    };
    var getCompany = function () {
        return companyid;
    };
    return {
        setCompany: setCompany,
        getCompany: getCompany
    };
});
