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

    function purchasedocdata_create(purchasedocid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata.create(data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedocdata_update(purchasedocid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata.update({id: data.rowid}, data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedocdata_batchupdate(data_array) {
        var update_promises = [];
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            data_array.forEach(function (docdata) {
                docdata.amount = docdata.quantity * docdata.price;
                update_promises.push(purchasedocdata.update({id: docdata.rowid}, docdata).$promise);
            });
            return $q.all(update_promises);
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedocdata_delete(rowid) {
        //return a promise for purchasedoc_delete
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata.delete({}, {"id": rowid}).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function make(doc, type) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return $http({
                method: "POST",
                url: "/api/makepdf",
                data: {"doc": doc, "type": type},
                headers: {"Authorization": getToken}
            });
        });
    }

    var documents = $resource(
        "/api/purchasedocuments/:id", {id: "@purchasedocid"}, {
            delete: {method: 'DELETE', headers: {"Authorization": getToken}},
            getfiles: {method: 'GET', isArray: false, headers: {"Authorization": getToken}}
        }
    );

    function getfiles() {
        return documents.getfiles().$promise;
    }

    function getfile(id) {
        return documents.getfiles({id: id}).$promise;
    }

    function delete_documents(id) {
        return tokenService.getToken().then(function (tokendata) {
            token = tokendata.token;
            return documents.delete({}, {"purchasedocid": id}).$promise;
        });
    }

    return {
        purchasedoc: {
            list: purchasedoc_list,
            create: purchasedoc_create,
            update: purchasedoc_update,
            delete: purchasedoc_delete,
            files: getfiles,
            file: getfile,
            delete_documents: delete_documents
        },
        purchasedocdata: {
            create: purchasedocdata_create,
            update: purchasedocdata_update,
            batch_update: purchasedocdata_batchupdate,
            delete: purchasedocdata_delete
        },
        make: make
    };
});