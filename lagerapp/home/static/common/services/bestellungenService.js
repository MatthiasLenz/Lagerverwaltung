angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory, tokenService, $q, $http, sessionService) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var token;
    var companies = ['01', '04', '05']; //Todo: make it dynamic
    var companyid = sessionService.getCompany; //initial default
    function getToken() {
        return "Token " + token;
    }

    var deliverynote = {};
    var purchasedoc = {};
    var purchasedocdata = {};
    var purchasedocsupplier = {};
    for (var i = 0; i < companies.length; i++) {
        purchasedoc[companies[i]] = $resource(
            "/api/" + companies[i] + "/purchasedoc/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}},
                update: {method: 'PATCH', headers: {"Authorization": getToken}},
            delete: {method: 'DELETE', headers: {"Authorization": getToken}}
            });
        deliverynote[companies[i]] = $resource(
            "/api/" + companies[i] + "/deliverynote/:id", {id: "@id"}, {
                create: {method: 'POST', headers: {"Authorization": getToken}},
                update: {method: 'PUT', headers: {"Authorization": getToken}},
                delete: {method: 'DELETE', headers: {"Authorization": getToken}}
            });
        purchasedocdata[companies[i]] = $resource(
            "/api/" + companies[i] + "/purchasedocdata/:id", {id: "@id"}, {
                create: {method: 'POST', headers: {"Authorization": getToken}},
                update: {method: 'PUT', headers: {"Authorization": getToken}},
                delete: {method: 'DELETE', headers: {"Authorization": getToken}}
            });
        purchasedocsupplier[companies[i]] = $resource(
            "/api/" + companies[i] + "/purchasedocsupplier/:id", {id: "@id"}, {}
        );
    }

    function clearCache() {
        purchasedocCache.removeAll();
    }

    function deliverynote_create(data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            data.responsible = tokendata.user;
            return deliverynote.create(data).$promise;
        });
    }

    function deliverynote_delete(rowid) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return deliverynotedata[companyid()].delete({}, {"id": rowid}).$promise;
        });
    }

    function purchasedoc_get(id) {
        return purchasedoc[companyid()].get(id).$promise;
    }
    function purchasedoc_list(kwargs) {
        return purchasedoc[companyid()].query({'status': kwargs.status, 'supplierid': kwargs.supplierid}).$promise;
    }

    function purchasedoc_create(data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            data.responsible = tokendata.user;
            return purchasedoc[companyid()].create(data).$promise;
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
            return purchasedoc[companyid()].delete({}, {"id": doc.id}).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedoc_update(id, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedoc[companyid()].update(id, data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedocdata_create(purchasedocid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata[companyid()].create(data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedocdata_update(purchasedocid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata[companyid()].update({id: data.rowid}, data).$promise;
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
                update_promises.push(purchasedocdata[companyid()].update({id: docdata.rowid}, docdata).$promise);
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
            return purchasedocdata[companyid()].delete({}, {"id": rowid}).$promise;
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

    function getsuppliers(status) {
        return tokenService.getToken().then(function (tokendata) {
            token = tokendata.token;
            return purchasedocsupplier[companyid()].query({}).$promise;
        });
    }
    return {
        purchasedoc: {
            get: purchasedoc_get,
            list: purchasedoc_list,
            create: purchasedoc_create,
            update: purchasedoc_update,
            delete: purchasedoc_delete,
            files: getfiles,
            file: getfile,
            delete_documents: delete_documents,
            suppliers: getsuppliers
        },
        purchasedocdata: {
            create: purchasedocdata_create,
            update: purchasedocdata_update,
            batch_update: purchasedocdata_batchupdate,
            delete: purchasedocdata_delete
        },
        deliverynote: {
            create: deliverynote_create,
            delete: deliverynote_delete
        },
        make: make
    };
});