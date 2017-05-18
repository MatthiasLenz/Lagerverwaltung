angular.module('baseApp').
directive('deliverynote', function () {
    return {
        templateUrl: 'static/bestellungen/directives/deliverynote.html',
        controller: ['$scope', '$q', 'bestellungenService', '$filter', '$mdDialog', 'sessionService','stockService','projectService','alertService',
            function ($scope, $q, bestellungenService, $filter, $mdDialog, sessionService, stockService, projectService) {
                var vm = this;
                //TODO remove vm.select
                sessionService.subscribeStockIDChange($scope, function () {
                    get_suppliers();
                });
                vm.select = null; //purchasedoc
                vm.articles = {};
                vm.supplier = null;
                vm.suppliers = [];
                vm.showDetail = {};
                vm.marked = "";
                vm.extdocno = "";
                vm.comment = "";
                vm.loading = false;
                get_suppliers();
                vm.detail = false;
                vm.getWidth = function getWidth(){
                    if(!vm.detail){
                      return '45';
                    }
                    else return '80';
                };
                vm.disableInput = function disableInput(id){
                    return id.includes('999');
                };
                vm.toggleDetail = function toggleDetail(){
                    vm.detail = !vm.detail;
                };
                function getEligibleArticles(articles) {
                    var eligible = {};
                    for (key in articles) {
                        var temp = [];
                        articles[key].forEach(function (item) {
                            if ((item.received == undefined && item.article.quantity != 0) ||
                                item.received < item.article.quantity - 0.001) {
                                temp.push(item);
                            }
                        });
                        if (temp != []) {
                            eligible[key] = temp;
                        }
                    }
                    return eligible;
                }
                vm.update = function () {
                    updateList();
                };
                vm.delivery_complete = function (prodid, articles) {
                    complete = true;
                    articles.forEach(function (item) {
                        if ((item.received == undefined && item.article.quantity != 0) ||
                            item.received < item.article.quantity - 0.001) {
                            complete = false;
                        }
                    });
                    return complete;
                };

                vm.total = function (articles) {
                    var total = 0;
                    articles.forEach(function (item) {
                        if (item.quantity !== undefined && item.quantity != null) {
                            total = total + parseFloat(item.quantity);
                        }
                    });
                    return total;
                };

                //Datepicker
                vm.dt = new Date();

                vm.open_datepicker = function () {
                    vm.popup.opened = true;
                };
                vm.disabled = function (date, mode) {
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                };
                vm.popup = {
                    opened: false
                };
                vm.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1
                };

                vm.exdocnum;
                //Todo bestellungen des lieferanten zusammenfassen, lieferung
                // möglichst wenigen bestellungen zuordnen
                // entweder total angeben, von dem abgezogen wird
                // oder automatisch im hintergrund die gelieferte menge auf die bestellungen aufteilen, beginnend mit der
                // ältesten.
                // deliverynote.orderid               = purchasedoc.id
                // deliverynotedata.purchasedocdataid = purchasedocdata.dataid
                function getArticleList(purchasedocs) {
                    // Digest related errors using this function in ng-repeat,
                    // it's better to use a property
                    // if the function creates a new object, the digest will recognize this as a change
                    // even if the return value is equal to the previous one
                    var articles = {};
                    purchasedocs.forEach(function (purchasedoc) {
                        purchasedoc.data.forEach(function (article) {
                            if (articles[article.prodid] == undefined) {
                                articles[article.prodid] = [];
                            }
                            articles[article.prodid].push({
                                purchasedocid: purchasedoc.id,
                                date: purchasedoc.docdate,
                                article: article,
                                received: 0
                            });
                        });
                        //item.id (purchasedocid)
                        purchasedoc.deliverynotes.forEach(function (delnote) {
                            //all deliverynotes corresponding to the purchases in 'articles'
                            delnote.data.forEach(function (delnote_article) {
                                //all articles of a specific deliverynote, has a purchasedocid
                                if (articles.hasOwnProperty(delnote_article.prodid)) {
                                    articles[delnote_article.prodid].forEach(function (article) {
                                        if (article.purchasedocid == purchasedoc.id) {
                                            if (article.received === undefined) {
                                                article.received = 0;
                                            }
                                            article.received = article.received + delnote_article.quantity;
                                        }
                                    });
                                }
                            });
                        });
                    });
                    vm.articles = getEligibleArticles(articles);
                }

                vm.supplierByID = {};
                function get_suppliers() {
                    vm.suppliers = [];
                    bestellungenService.purchasedoc.suppliers().then(function (result) {
                        result.forEach(function (item) {
                            vm.suppliers.push(item);
                            vm.supplierByID[item.id] = item;
                        });
                    });

                }

                vm.mark = function (prodid) {
                    vm.marked = prodid;
                };

                function updateList() {
                    vm.loading = true;
                    var purchasedocs = [];
                    if (vm.supplier) {
                        return bestellungenService.purchasedoc.list({
                            'status': "2,3",
                            'supplierid': vm.supplier.id
                        }).then(function (result) {
                            for (let i=0; i<result.length; i++){
                                let item = result[i];
                                item.supplier = vm.supplierByID[item.supplierid];
                                purchasedocs.push(item);
                                vm.showDetail[item.id] = false;
                            }
                            getArticleList(purchasedocs);
                            vm.loading=false;
                        });
                    }
                    else return $q.when(0);
                }

                function prepare() {
                    var deliverynotes = {};
                    var delnote, data;
                    for (article in vm.articles) {
                        //vergleich mit vm.articles-> quantity
                        vm.articles[article].forEach(function (doc) {
                            if (doc.quantity !== undefined && doc.quantity != null) {
                                delnote = deliverynotes[doc.purchasedocid];
                                if (delnote === undefined) {
                                    deliverynotes[doc.purchasedocid] = {};
                                    delnote = deliverynotes[doc.purchasedocid];
                                    delnote.supplierid = vm.supplier.id;
                                    delnote.extdocno = vm.extdocno;
                                    delnote.subject = vm.comment;
                                    delnote.docdate = vm.dt;
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
                    var delnote_list = [];
                    for (purchasedocid in deliverynotes) {
                        delnote_list.push(deliverynotes[purchasedocid]);
                    }
                    return delnote_list;
                }

                function create(delnote_list) {
                    let last = bestellungenService.deliverynote.create(delnote_list[0]);
                    delnote_list.slice(1).forEach(function (note) {
                        last = last.then(function (response) {
                            return bestellungenService.deliverynote.create(note);
                        });
                    });
                    return last; //return the last promise
                }
                function create_delnote(delnote){
                    return bestellungenService.deliverynote.create(note);
                }
                let update_stock = function(deliverynote){
                    let promises = [];
                    for (let i = 0; i < deliverynote.data.length; i++) {
                        let article = deliverynote.data[i];
                        promises.push(stockService.stockdata_getbyprodid(article.prodid)
                            .then(function(response){
                                if (response.results[0] !== undefined){
                                    var stockdataid = response.results[0].id;
                                    var new_quantity = response.results[0].quantitycur+article.quantity;
                                    return stockService.stockdata_update({id:stockdataid},
                                        {quantitycur: new_quantity, quantityavail: new_quantity});
                                }
                                else return 0;
                            }));
                    }
                    return $q.allSettled(promises).then(function(){
                         return deliverynote;
                    });
                };

                vm.save = save;
                function save(ev) {
                    var delnote_list = prepare();
                    $mdDialog.show({
                            controller: confirmDialogController,
                            templateUrl: 'static/bestellungen/directives/deliverynote.confirm.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: false,
                            controllerAs: "confirm",
                            locals: {supplier: vm.supplier, deliverynotes: delnote_list},
                            bindToController: true
                        })
                        .then(function success(answer) {
                            //ok
                            // create the deliverynotes sequentially, but go forward with a $q.all so we get an
                            // array of all the results
                            let promises = [];
                            let last = bestellungenService.deliverynote.create(delnote_list[0]);
                            promises.push(last);
                            delnote_list.slice(1).forEach(function (note) {
                                last = last.then(function () {
                                    let notePromise = bestellungenService.deliverynote.create(note);
                                    promises.push(notePromise);
                                    return notePromise;
                                });
                            });
                            last.then(function(){
                                return $q.all(promises);
                            })
                            .then(function success(deliverynotes) {
                                let promises = [];
                                deliverynotes.forEach(function (note) {
                                    promises.push(update_stock(note));
                                });
                                return deliverynotes;
                            })
                            .then(function(deliverynotes){
                                deliverynotes[0].deliverytype = "eingang";
                                let last = projectService.consumedproduct_createfrompurchasedoc(deliverynotes[0], true);
                                deliverynotes.slice(1).forEach(function (note) {
                                    note.deliverytype = "eingang";
                                    last = last.then(function (){
                                        return projectService.consumedproduct_createfrompurchasedoc(note, true);
                                    });
                                });
                                return last;
                            })
                            .then(function success(response){
                                updateList().then(function(){
                                    return showAlert('Lieferscheine erfolgreich eingetragen.');
                                });
                            })
                            .catch(function(err){
                                showAlert("Fehler beim Eintragen der Lieferscheine.")
                            });
                        }, function error() {
                            //abbrechen
                        });
                }
                function confirmDialogController($mdDialog) {
                    var vm = this;
                    vm.hide = function () {
                        $mdDialog.hide();
                    };

                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };

                    vm.ok = function (answer) {
                        $mdDialog.hide();
                    };
                }

                showAlert = function (text) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title(text)
                            .textContent('')
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                    );
                };
            }
        ],
        controllerAs: 'deliverynote'
    };

});
