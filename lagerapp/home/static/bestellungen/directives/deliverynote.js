angular.module('baseApp').
directive('deliverynote', function () {
    return {
        templateUrl: 'static/bestellungen/directives/deliverynote.html',
        controller: ['$scope', 'bestellungenService', 'supplierService', '$filter', '$mdToast',
            function ($scope, bestellungenService, supplierService, $filter, $mdToast) {
                var controller = this;
                //TODO remove controller.select
                controller.select = null; //purchasedoc
                controller.list = [];
                controller.articles = {};
                controller.supplierid = '';
                controller.suppliers = [];
                controller.showDetail = {};
                controller.marked = "";
                window.scope11 = controller;
                get_suppliers();

                controller.update = function () {
                    updateList();
                };
                controller.delivery_complete = function (prodid, articles) {
                    complete = true;
                    articles.forEach(function (item) {
                        if (item.delivered_quantity < item.article.quantity) {
                            complete = false;
                        }
                    });
                    return complete;
                };
                controller.total = function (articles) {
                    total = 0;
                    articles.forEach(function (item) {
                        if (item.quantity !== undefined) {
                            total = total + parseInt(item.quantity);
                        }
                    });
                    return total;
                };

                //Datepicker
                controller.dt = new Date();

                controller.open_datepicker = function () {
                    controller.popup.opened = true;
                };
                controller.disabled = function (date, mode) {
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                };
                controller.popup = {
                    opened: false
                };
                controller.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1
                };

                controller.exdocnum;
                //Todo bestellungen des lieferanten zusammenfassen, lieferung
                // möglichst wenigen bestellungen zuordnen
                // entweder total angeben, von dem abgezogen wird
                // oder automatisch im hintergrund die gelieferte menge auf die bestellungen aufteilen, beginnend mit der
                // ältesten.
                // deliverynote.orderid               = purchasedoc.id
                // deliverynotedata.purchasedocdataid = purchasedocdata.dataid
                function getArticleList() {
                    // Digest related errors using this function in ng-repeat,
                    // it's better to use a property
                    // if the function creates a new object, the digest will recognize this as a change
                    // even if the return value is equal to the previous one
                    controller.articles = {};
                    controller.list.forEach(function (item) {
                        item.data.forEach(function (article) {
                            if (controller.articles[article.prodid] == undefined) {
                                controller.articles[article.prodid] = [];
                            }
                            controller.articles[article.prodid].push({
                                purchasedocid: item.id,
                                date: item.docdate,
                                article: article
                            });
                        });
                        //item.id (purchasedocid)
                        item.deliverynotes.forEach(function (delnote) {
                            //all deliverynotes corresponding to the purchases in 'articles'
                            delnote.data.forEach(function (data) {
                                //all articles of a specific deliverynote, has a purchasedocid
                                //$mdToast.show($mdToast.simple().textContent(data.prodid));
                                if (controller.articles.hasOwnProperty(data.prodid)) {
                                    controller.articles[data.prodid].forEach(function (article) {
                                        if (article.purchasedocid == item.id) {
                                            article.delivered_quantity = data.quantity;
                                        }
                                    });

                                }
                            });
                        });
                    });
                }
                controller.new_edit_delnote = function () {
                    var data = {
                        "module": 5, "status": 1, "orderid": controller.select.id,
                        "supplierid": controller.select.supplierid,
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'), "data": []
                    };
                    controller.select.data.forEach(function (item) {
                        data.data.push({
                            "rowid": null, "prodid": item.prodid, "name": item.name, "unit": item.unit, "quantity": 0,
                            "price": item.price, "amount": 0
                        });
                    });
                    controller.edit_delnote = data;
                };
                function get_suppliers() {
                    bestellungenService.purchasedoc.suppliers().then(function (result) {
                        result.forEach(function (item) {
                            controller.suppliers.push(item);
                        });
                    });
                }

                controller.add_delnote = function () {
                    var data = {
                        "module": 5, "status": 1, "orderid": controller.select.id,
                        "supplierid": controller.select.supplierid,
                        "docdate": $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'), "data": []
                    };
                    controller.select.data.forEach(function (item) {
                        data.data.push({
                            "rowid": null, "prodid": item.prodid, "name": item.name, "unit": item.unit, "quantity": 0,
                            "price": item.price, "amount": 0
                        });
                    });
                    bestellungenService.deliverynote.create(data).then(function () {

                        bestellungenService.purchasedoc.get({id: controller.select.id}).then(function (result) {
                            //reload
                            supplier = controller.select.supplier;
                            controller.select = result;
                            controller.select.supplier = supplier;
                        });
                    });
                };

                controller.mark = function (prodid) {
                    controller.marked = prodid;
                };
                controller.edit_doc = function (doc) {
                    var temp = doc.edit;
                    controller.list.forEach(function (item) {
                        item.edit = false;
                    });
                    doc.edit = !temp;
                };
                controller.delete_doc = function (doc) {
                    bestellungenService.purchasedoc.delete(doc).then(function () {
                        updateList();
                    });
                };

                function updateList() {
                    controller.list = [];
                    bestellungenService.purchasedoc.list({
                        'status': "2,3",
                        'supplierid': controller.supplierid
                    }).then(function (result) {
                        result.forEach(function (item) {
                            supplier = supplierService.resource.query({'id': item.supplierid});
                            item.supplier = supplier;
                            controller.list.push(item);
                            controller.showDetail[item.id] = false;
                        });
                    }).then(function (result) {
                        getArticleList();
                    });

                }

                controller.toggleDetail = function (id) {
                    controller.showDetail[id] = !(controller.showDetail[id]);
                };
                var deliverynotes = {};
                controller.save = function () {
                    //Todo: Clear the lists
                    for (article in controller.articles) {
                        //vergleich mit controller.articles-> quantity
                        controller.articles[article].forEach(function (doc) {
                            if (doc.quantity !== undefined) {
                                console.log(doc.purchasedocid + " " + article + " " + doc.quantity);
                                if (deliverynotes[doc.purchasedocid] === undefined) {
                                    deliverynotes[doc.purchasedocid] = [];
                                }
                                deliverynotes[doc.purchasedocid].push(article + " " + doc.quantity + " " +
                                    doc.article.price + " " + controller.dt + " " + controller.extdocnum);
                            }
                        });
                    }
                    console.log(deliverynotes);
                };
            }],
        controllerAs: 'deliverynote'
    };
});
