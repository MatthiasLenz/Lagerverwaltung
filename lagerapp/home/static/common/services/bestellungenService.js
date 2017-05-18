angular.module('baseApp.Services').
factory("bestellungenService", function ($resource, $cacheFactory, tokenService, $q, $http, sessionService) {
    var purchasedocCache = $cacheFactory('PurchaseDoc');
    var documentCache = $cacheFactory('Documents');
    var lagerausgangCache = $cacheFactory('Lagerausgang');
    var productsupplierCache = $cacheFactory("Productsupplier");
    var token;
    var companies = null;
    var stockid = sessionService.getStock;
    function getToken() {
        return "Token " + token;
    }
    function getCompanyFromProjectID(projectid){
        if (projectid === 'TEST3') {

        }
        return "0"+projectid.charAt(0);
    }
    function getCompanyFromPurchasedocID(purchasedocid){
        return "0"+purchasedocid.charAt(0);
    }
    var deliverynote = {};
    var purchasedoc = {};
    var purchasedocdata = {};
    var internalpurchasedoc = {};
    var purchasedocsupplier = {};
    function init_resources(){
        for (var i = 0; i < companies.length; i++) {
            purchasedoc[companies[i]] = $resource(
                "/api/" + companies[i] + "/purchasedoc/:id", {id: "@id"}, {
                create: {method: 'POST', headers: {"Authorization": getToken}},
                update: {method: 'PATCH', headers: {"Authorization": getToken}},
                delete: {method: 'DELETE', headers: {"Authorization": getToken}}
                });
            internalpurchasedoc[companies[i]] = $resource(
                "/api/" + companies[i] + "/internalpurchasedoc/:id", {id: "@id"}, {
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
                "/api/" + companies[i] + "/purchasedocsupplier/:id", {id: "@id"}, {
                });
            productsupplier = $resource(
                "/api/productsupplier/:id", {id: "@id"},{
                    query: {method: 'GET', cache: productsupplierCache,  isArray: false }
                });
        }
    }

    var companyid = null;
    function init (){
        return sessionService.getConfig()
            .then(function (config_data){
                companyid = config_data.company.id;
                companies = Object.keys(config_data.stockbyid);
                init_resources();
                return companyid;
            })
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
            data.stockid = stockid();
            return deliverynote[companyid].create(data).$promise;
        });
    }

    function deliverynote_delete(rowid) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return deliverynotedata[companyid].delete({}, {"id": rowid}).$promise;
        });
    }

    function purchasedoc_get(id) {
        return purchasedoc[companyid].get(id).$promise;
    }
    function internalpurchasedoc_get(id) {
        company = getCompanyFromPurchasedocID(id.id);
        return internalpurchasedoc[company].get(id).$promise;
    }
    function purchasedoc_list(kwargs) {
        return purchasedoc[companyid].query(kwargs).$promise;
    }
    var lagerausgang = $resource(
        "/api/lagerausgang/:id", {id: "@id"}, {
            create: {method: 'POST', headers: {"Authorization": getToken}},
            delete: {method: 'DELETE', headers: {"Authorization": getToken}, cache: lagerausgangCache},
            update: {method: 'PATCH', headers: {"Authorization": getToken}}
        }
    );

    function lagerausgang_list(kwargs) {
        return lagerausgang.query(kwargs).$promise;
    }

    function lagerausgang_update(id, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return lagerausgang.update(id, data).$promise;
        }).then(function (response) {
            clearCache();
            return response;
        });
    }
    function lagerausgang_create(data) { //(stockid, projectid1, projectid2, purchasedocid1, purchasedocid2, docdate, responsible, pdf, abholer)
        return tokenService.getToken()
            .then(function (tokendata) {
                token = tokendata.token;
                return lagerausgang.create(data).$promise;
            }).then(function (response) {
                clearCache();
                return response;
            });
    }
    function lagerausgang_delete(id) {
        //return a promise for purchasedoc_delete
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return lagerausgang.delete({}, {"id": id}).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function internalpurchasedoc_list(kwargs) {
        return internalpurchasedoc[companyid].query(kwargs).$promise;
    }
    function purchasedoc_create(data) {
        return tokenService.getToken()
            .then(function (tokendata) {
                token = tokendata.token;
                data.responsible = tokendata.user;
                return purchasedoc[companyid].create(data).$promise;
            }).then(function (response) {
                clearCache();
                return response;
            });
    }
    function internalpurchasedoc_create(data) {
        companyid = getCompanyFromProjectID(data.modulerefid);
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return internalpurchasedoc[companyid].create(data).$promise;
        }).then(function (response) {
            clearCache();
            return response;
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
            return purchasedoc[companyid].delete({}, {"id": doc.id}).$promise;
        }).then(function (response) {
            clearCache();
        });
    }
    function internalpurchasedoc_delete(doc) {
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
            return internalpurchasedoc[companyid].delete({}, {"id": doc.id}).$promise;
        }).then(function (response) {
            clearCache();
        });
    }
    function purchasedoc_update(id, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedoc[companyid].update(id, data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }
    function internalpurchasedoc_update(id, data) {
        companyid = getCompanyFromProjectID(data.modulerefid);
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return internalpurchasedoc[companyid].update(id, data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }
    /* ToDo: generalise
    function update(resource, args){
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return resource.update(args.id, args.data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }*/

    function purchasedocdata_create(purchasedocid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata[companyid].create(data).$promise;
        }).then(function (response) {
            clearCache();
        });
    }

    function purchasedocdata_update(purchasedocid, data) {
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return purchasedocdata[companyid].update({id: data.rowid}, data).$promise;
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
                update_promises.push(purchasedocdata[companyid].update({id: docdata.rowid}, docdata).$promise);
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
            return purchasedocdata[companyid].delete({}, {"id": rowid}).$promise;
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
                url: "/api/" + companyid + "/makepdf",
                data: {"doc": doc, "type": type},
                headers: {"Authorization": getToken}
            });
        });
    }
    function makeinternal(doc, type, kunde){
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return $http({
                method: "POST",
                url: "/api/" + companyid + "/lagerausgangmakepdf",
                data: {doc: doc, type: type, kunde: kunde},
                headers: {Authorization: getToken}
            });
        });
    }
    function makekleingeraete(doc, type, abholer){
        return tokenService.getToken().then(function (response) {
            return response;
        }).then(function (tokendata) {
            token = tokendata.token;
            return $http({
                method: "POST",
                url: "/api/" + companyid + "/kleingeraetemakepdf",
                data: {"doc": doc, "type": type, "abholer": abholer},
                headers: {"Authorization": getToken}
            });
        });
    }
    var documents = $resource(
        "/api/purchasedocuments/:id", {id: "@purchasedocid"}, {
            delete: {method: 'DELETE', headers: {"Authorization": getToken}, cache: documentCache},
            getfiles: {method: 'GET', isArray: true, headers: {"Authorization": getToken}, cache: documentCache},
            getfile: {method: 'GET', isArray: false, headers: {"Authorization": getToken}, cache: documentCache}
        }
    );

    function getfiles() {
        return documents.getfiles().$promise;
    }

    function getfile(id) {
        return documents.getfile({id: id}).$promise;
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
            return purchasedocsupplier[companyid].query({}).$promise;
        });
    }

    function get_productsupplier(prodid) {
        return tokenService.getToken().then(function (tokendata) {
            token = tokendata.token;
            return productsupplier.query({prodid:prodid}).$promise;
        });
    }

    return {
        init: init,
        get_productsupplier: get_productsupplier,
        internalpurchasedoc: {
            get: internalpurchasedoc_get,
            list: internalpurchasedoc_list,
            create: internalpurchasedoc_create,
            update: internalpurchasedoc_update,
            delete: internalpurchasedoc_delete
        },
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
        lagerausgang: {
            list: lagerausgang_list,
            update : lagerausgang_update,
            create: lagerausgang_create,
            delete: lagerausgang_delete
        },

        make: make,
        makeinternal: makeinternal,
        makekleingeraete: makekleingeraete
    };
});