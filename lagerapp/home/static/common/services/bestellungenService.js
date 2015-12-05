angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory, tokenService, $q) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var token;

    function getToken() {
        return "Token " + token;
    }

    var purchasedoc = $resource(
        "/api/purchasedoc/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}},
            delete: {method: 'DELETE', headers: {"Authorization": getToken}}
        }
    );

    var purchasedocdata = $resource(
        "/api/purchasedocdata/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}},
            delete: {method: 'DELETE', headers: {"Authorization": getToken}}
        }
    );

    function clearCache() {
        purchasedocCache.removeAll();
    }

    function purchasedoc_list(kwargs) {
        return purchasedoc.query({'status': kwargs.status}).$promise;
    }

    function purchasedoc_create(data) {
        tokenService.getToken().then(function (response) {
            token = response.token;
            data.responsible = token.user;
            purchasedoc.create(data).$promise.then(function (response) {
                clearCache();
            });
        });
    }

    function purchasedoc_delete(doc) {
        tokenService.getToken().then(function (response) {
            token = response.token;
            promises = [];
            doc.data.forEach(function (item) {
                promises.push(purchasedocdata_delete(item.rowid));
            });
            $q.all(promises).then(function () {
                //after all the purchasedocdata entries for purchasedoc are deleted
                purchasedoc.delete({}, {"id": doc.id}).$promise.then(function (response) {
                    clearCache();
                });
            });
        });
    }

    function purchasedocdata_create(data) {
        tokenService.getToken().then(function (response) {
            token = response.token;
            purchasedocdata.create(data).$promise.then(function (response) {
                clearCache();
            });
        });
    }

    function purchasedocdata_delete(id) {
        //return a promise for purchasedoc_delete
        return tokenService.getToken().then(function (response) {
            token = response.token;
            purchasedocdata.delete({}, {"id": id}).$promise.then(function (response) {
                clearCache();
            });
        });
    }

    return {
        purchasedoc: {
            list: purchasedoc_list,
            create: purchasedoc_create,
            delete: purchasedoc_delete
        },
        purchasedocdata: {
            create: purchasedocdata_create,
            delete: purchasedocdata_delete
        }
    };
});