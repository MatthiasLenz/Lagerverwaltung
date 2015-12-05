angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory, tokenService, $q) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var token;


    function getToken() {
        return "Token " + token;
    }

    var resource = $resource(
        "/api/purchasedoc\\/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}}
        }
    );

    function clearCache() {
        purchasedocCache.removeAll();
    }

    function list(kwargs) {
        return resource.query({'status': kwargs.status}).$promise;
    }

    function create(data) {
        tokenService.getToken().then(function (response) {
            token = response.token;
            data.responsible = token.user;
            resource.create(data).$promise.then(function (response) {
                clearCache();
            });
        });
    }

    return {
        clearCache: clearCache,
        resource: resource,
        list: list,
        create: create
    };
});