angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var token;

    function setToken(value) {
        token = value;
    }

    function getToken() {
        return "Token " + token;
    }
    var resource = $resource(
        "/api/purchasedoc\\/:id", {id: "@id"}, {
            query: {method: 'GET', cache: purchasedocCache, isArray: true},
            create: {method: 'POST', headers: {"Authorization": getToken}}
        }
    );

    function clearCache() {
        purchasedocCache.removeAll();
    }
    return {
        setToken: setToken,
        clearCache: clearCache,
        resource: resource
    };
});