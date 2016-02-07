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
                controller.supplier = null;
                controller.suppliers = [];
                controller.showDetail = {};
                controller.marked = "";
                controller.extdocno = "";
                controller.comment = "";
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
                                            if (article.delivered_quantity === undefined) {
                                                article.delivered_quantity = 0;
                                            }
                                            article.delivered_quantity = article.delivered_quantity + data.quantity;
                                        }
                                    });
                                }
                            });
                        });
                    });
                }

                function get_suppliers() {
                    bestellungenService.purchasedoc.suppliers().then(function (result) {
                        result.forEach(function (item) {
                            controller.suppliers.push(item);
                        });
                    });
                }

                controller.mark = function (prodid) {
                    controller.marked = prodid;
                };

                function updateList() {
                    controller.list = [];
                    bestellungenService.purchasedoc.list({
                        'status': "2,3",
                        'supplierid': controller.supplier.id
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
                //Todo: Summe in geliefert wird falsch berechnet
                controller.save = function () {
                    deliverynotes = {};
                    for (article in controller.articles) {
                        //vergleich mit controller.articles-> quantity
                        controller.articles[article].forEach(function (doc) {
                            if (doc.quantity !== undefined) {
                                console.log(doc.purchasedocid + " " + article + " " + doc.quantity);
                                delnote = deliverynotes[doc.purchasedocid];
                                if (delnote === undefined) {
                                    deliverynotes[doc.purchasedocid] = {};
                                    delnote = deliverynotes[doc.purchasedocid];
                                    delnote.supplierid = controller.supplier.id;
                                    delnote.extdocno = controller.extdocno;
                                    delnote.subject = controller.comment;
                                    delnote.docdate = controller.dt;
                                    delnote.orderid = doc.purchasedocid;
                                    delnote.status = 1;
                                    delnote.module = 5;
                                }
                                data = {
                                    "rowid": null, "prodid": doc.article.prodid,
                                    "name": doc.article.name, "unit": doc.article.unit,
                                    "quantity": doc.quantity, "price": doc.article.price,
                                    "packing": doc.article.packing, "amount": doc.quantity * doc.article.price
                                };

                                if (delnote.data === undefined) {
                                    delnote.data = [data];
                                }
                                else {
                                    delnote.data.push(data);
                                }
                            }
                        });
                    }
                    delnote_list = [];
                    for (purchasedocid in deliverynotes) {
                        delnote_list.push(deliverynotes[purchasedocid]);
                    }
                    last = bestellungenService.deliverynote.create(delnote_list.shift());
                    delnote_list.forEach(function (note) {
                        last = last.then(function (response) {
                            console.log(note);
                            console.log(delnote_list);
                            console.log(delnote_list.length);
                            return bestellungenService.deliverynote.create(note);
                        });
                    });
                    console.log(deliverynotes);
                    updateList();
                };
            }],
        controllerAs: 'deliverynote'
    };
});
