angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory, tokenService, $q, $http) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var token;

    function getToken() {
        return "Token " + token;
    }

    var purchasedoc = $resource(
        "/api/purchasedoc/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}},
            update: {method: 'PUT', headers: {"Authorization": getToken}},
            delete: {method: 'DELETE', headers: {"Authorization": getToken}}

        }
    );

    var purchasedocdata = $resource(
        "/api/purchasedocdata/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}},
            update: {method: 'PUT', headers: {"Authorization": getToken}},
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
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            data.responsible = tokendata.user;
            return purchasedoc.create(data).$promise;
        }).then(function (response) {
                clearCache();
        });
    }

    function purchasedoc_delete(doc) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            promises = [];
            doc.data.forEach(function (item) {
                promises.push(purchasedocdata_delete(item.rowid));
            });
            return $q.all(promises);
        }).then(function () {
            //after all the purchasedocdata entries for purchasedoc are deleted
            return purchasedoc.delete({}, {"id": doc.id}).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedoc_update(id, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedoc.update(id, data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }
    function purchasedocdata_create(data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata.create(data).$promise;
        }).then(function (response) {
                clearCache();
        });
    }

    function purchasedocdata_update(rowid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata.update(rowid, data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }
    function purchasedocdata_delete(id) {
        //return a promise for purchasedoc_delete
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata.delete({}, {"id": id}).$promise;
        }).then(function (response) {
                clearCache();
        });
    }

    function makepdf(doc) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return $http({
                method: "POST",
                url: "/api/makepdf",
                data: {"doc": doc},
                headers: {"Authorization": getToken}
            });
        });
    }

    return {
        purchasedoc: {
            list: purchasedoc_list,
            create: purchasedoc_create,
            update: purchasedoc_update,
            delete: purchasedoc_delete
        },
        purchasedocdata: {
            create: purchasedocdata_create,
            update: purchasedocdata_update,
            delete: purchasedocdata_delete
        },
        makepdf: makepdf
    };
});