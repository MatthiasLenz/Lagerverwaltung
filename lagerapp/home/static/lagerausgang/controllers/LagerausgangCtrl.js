angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', ['$http', '$timeout', '$q', '$scope',
    'stockService', 'projectService', 'bestellungenService', 'staffService', '$window', 'alertService',
    function ($http, $timeout, $q, $scope, stockService,  projectService, bestellungenService,
              staffService, $window, alertService) {
        var vm = this;
        window.show = this;
        vm.deleteconsumed = function (purchasedocid) {
            $http({
                method: 'DELETE',
                url: '/api/01/consumedproduct/1-0554',
                data: {purchasedocid: purchasedocid},
                dataType: 'json',
                headers: {
                    "Authorization": "Token "+tokenService.getToken(),
                    "Content-Type": "application/json"
                }
            }).then(function (response) {
                vm.consumed = response;
            })
        };
        vm.selectedCustomer = "01";
        vm.abholer = "";
        vm.packings = {};
        vm.files = {};
        vm.simulateQuery = false;
        vm.isDisabled = false;
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
        vm.internalpurchasedocs = [];
        stockService.currentStock({})
            .then(function (data) {
                vm.stock = data;
            });
        // list of `state` value/display objects
        vm.queryStaff = queryStaff;
        vm.queryStock = queryStock;
        vm.queryProject = queryProject;
        vm.projectDocs = [];
        initDocs();
        vm.selectedProjectChange = selectedProjectChange;
        vm.selectedProductChange = selectedProductChange;
        vm.searchTextChange = searchTextChange;
        vm.getTotal = getTotal;
        vm.save = save;
        vm.make = make;
        vm.selectedProducts = [{id: 0, quantity: null, article: null}];
        vm.addRow = addRow;
        vm.deleteRow = deleteRow;
        vm.direction = "row";

        vm.swap_direction = function () {
            if (vm.direction == "row") {
                vm.direction = "column";
            }
            else {
                vm.direction = "row";
            }
        };
        vm.delete_doc = function (doc) {
            bestellungenService.internalpurchasedoc.delete(doc).then(function () {
                initDocs();
            });
        };
        vm.edit_doc = function (doc) {
            var temp = doc.edit;
            vm.internalpurchasedocs.forEach(function (item) {
                item.edit = false;
            });
            doc.edit = !temp;
        };
        vm.save_doc = function (doc) {
            doc.edit = false;
            //if all updates are started at the same time, the tokenService might not have a token yet (if the
            //user did not log in) and it will prompt the login view for each update
            bestellungenService.purchasedocdata.batch_update(doc.data).then(function () {
                vm.refresh_documents(doc);
            });
        };
        vm.delete_docdata = function (doc, rowid) {
            bestellungenService.purchasedocdata.delete(rowid).then(function () {
                var data = [];
                for (var i = 0; i < doc.data.length; i++) {
                    if (doc.data[i].rowid != rowid) {
                        data.push(doc.data[i]);
                    }
                }
                doc.data = data;
                vm.refresh_documents(doc);
            });
        };
        vm.refresh_documents = function (doc) {
            bestellungenService.purchasedoc.delete_documents(doc.id).then(function () {
                make(doc, 'pdf', doc.remark).then(function (response) {
                    initDocs();
                });
            }, function (error) {
                make(doc, 'pdf', doc.remark).then(function () {
                    initDocs();
                });
            });
        };

        function save() {
            if (!vm.selectedProject){
                alertService.showAlert('Bitte wählen Sie eine Baustelle aus.');
                return 0;
            }
            if (vm.selectedProducts.length==0 || !vm.selectedProducts[0].article){
                alertService.showAlert('Keine Artikel ausgewählt.');
                return 0;
            }
            var manager = vm.selectedProject.manager ? vm.selectedProject.manager.id : '';
            var leader = vm.selectedProject.leader ? vm.selectedProject.leader.id : '';
            var articles = [];
            for (var i = 0; i < vm.selectedProducts.length; i++) {
                article = vm.selectedProducts[i];
                var packing = article.selectedpacking.quantity!=1 ? "Verpackung: "+ article.quantity+' '+article.selectedpacking.name : "";
                articles.push({
                    "rowid": null,
                    "prodid": article.article.prodid.id, "name": article.article.prodid.name1,
                    "unit": article.article.prodid.unit1,
                    "quantity": Math.round(article.quantity*article.selectedpacking.quantity * 1000) / 1000,
                    "price": article.article.prodid.netpurchaseprice,
                    "amount": article.quantity * article.article.prodid.netpurchaseprice,
                    "packing": packing,
                    "comment":""
                });
            }

            data = {
                "doctype": 3, "module": 9, "status": 4,
                "subject": vm.selectedProject.description,
                "responsible": manager,
                "leader": leader,
                "remark": vm.abholer,
                "supplierid": "SOLID-SCHIEREN", // ToDo: variabel
                "modulerefid": vm.selectedProject.id,
                "docdate": vm.dt,
                "data": articles,
                "deliverynotes": []
            };
            var purchasedoc = null;
            //1: create purchasedoc, 2: create consumed product for selected project, 3: make PDF document of purchasedoc
            bestellungenService.internalpurchasedoc.create(data)
                .then(
                    /*success:*/ function(response) {
                        purchasedoc = response;
                        return projectService.consumedproduct_create(vm.selectedProject, {
                            docdate: vm.dt, articles: vm.selectedProducts,
                            purchaseref: purchasedoc.id, supplierid: purchasedoc.supplierid
                        })
                    },
                    /*error:*/ function(error){ return $q.reject("purchasedoc_error"); }
                )
                .then(
                    /*success:*/ function(response) {
                        console.log(response);
                        return make(purchasedoc, 'pdf', purchasedoc.remark);
                    },
                    /*error:*/ function(error) {
                        if (error == "purchasedoc_error"){
                            return $q.reject(error);
                        }
                        return $q.reject("consumedproduct_error"); }
                )
                .then(
                    /*success:*/ function(response) {
                        refreshDocs();
                        clear();
                        alertService.showAlert('Lagerausgang erfolgreich eingetragen.').then(function () {
                            $window.open(response.data, '_blank');
                        });
                    },
                    /*error:*/ function(error) {
                        switch (error){
                            case "purchasedoc_error":
                                alertService.showAlert('Beim Eintragen des Lagerausgangs ist ein Fehler aufgetreten.');
                                break;
                            case "consumedproduct_error":
                                alertService.showAlert('Beim Eintragen ins Projekt ist ein Fehler aufgetreten.');
                                bestellungenService.internalpurchasedoc.delete(purchasedoc); //clean up
                                break;
                            default:
                                alertService.showAlert('Daten in Lagerausgang und Projekt eingetragen. Beim Erstellen des Dokuments ist ein Fehler aufgetreten.');
                                refreshDocs();
                                break;
                        }
                        return $q.reject("make_error");
                    }
                )
        }
        function clear(){
            vm.selectedProject = null;
            vm.selectedProducts = [{id: 0, quantity: null, article: null}];
            vm.abholer = "";
            vm.searchAbholer = "";
            vm.searchProject = "";
        }
        function getTotal() {
            var total = 0;
            for (var i = 0; i < vm.selectedProducts.length; i++) {
                var row = vm.selectedProducts[i];
                if (row.quantity && row.article) {
                    var quantity = Math.round(row.quantity*row.selectedpacking.quantity * 1000) / 1000;
                    var price = row.article.prodid.netpurchaseprice;
                    var amount = quantity * price;
                    total += amount;
                }
            }
            return total;
        }
        function queryStaff(query) {
            return $q(function (resolve, reject) {
                staffService.list({
                    search: query,
                }).then(function (response) {
                    resolve(response.results);
                });
            })
        }
        function queryStock(query) {
            return $q(function (resolve, reject) {
                stockService.articlelist_noload({
                    search: query
                }).then(function (response) {
                    resolve(response.results);
                });
            })
        }

        function queryProject(query) {
            return $q(function (resolve, reject) {
                projectService.project_list({
                    search: query,
                }).then(function (response) {
                    resolve(response.results);
                });
            })
        }

        function searchTextChange(text) {
        }

        function selectedProjectChange(item) {
            refreshDocs();
        }

        function selectedProductChange(row) {
            if (row.article!= null && typeof row.article.prodid !== "undefined" ) {
                //default packing unit
                var packdata = {name: row.article.prodid.unit1, quantity:1, changed:false};
                row.packings = [packdata];
                row.selectedpacking = row.packings[0];
                row.article.prodid.packing.forEach(
                    function (entry) {
                        var packdata = {};
                        var id;
                        $http.get(entry).then(function (response) {
                            //Get productpacking data
                            packdata["name"] = response.data.name;
                            packdata["quantity"] = response.data.quantity;
                            packdata["changed"] = false;
                            id = response.data.packingid;
                            row.packings.push(packdata);
                        });
                    });
            }
        }
        vm.show=vm.selectedProducts;
        function addRow() {
            var newRowID = vm.selectedProducts.length + 1;
            vm.selectedProducts.push({id: newRowID, quantity: null, article: null, selectedpacking:null});
        }

        function deleteRow(rowid) {
            for (var i = 0; i < vm.selectedProducts.length; i++) {
                if (rowid == vm.selectedProducts[i].id) {
                    vm.selectedProducts.splice(i, 1);
                }
            }

            vm.selectedProducts
        }

        function createFilterFor(query) {
            //offline filter for data set
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };
        }

        function newState(state) {
            alert("Sorry! You'll need to create a Constituion for " + state + " first!");
        }

        function refreshDocs() {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - 1);
            dt = dt.toISOString().slice(0, 10);
            if(vm.searchProject){
                bestellungenService.internalpurchasedoc.list({
                    status: 4, modulerefid: vm.selectedProject.id,
                    min_date: dt
                }).then(function (data) {
                    vm.projectDocs = data;
                })
                .catch(function(error){
                    console.log(error);
                })
            }
            else{
                vm.projectDocs = null;
            }

        }
        function initDocs() {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - 1);
            dt = dt.toISOString().slice(0, 10);
                bestellungenService.internalpurchasedoc.list({
                    status: 4,
                    min_date: dt
                }).then(function (data) {
                    vm.projectDocs = data;
                })
                .catch(function(error){
                    console.log(error);
                })

        }
        function make(doc, type, abholer) {
            return bestellungenService.makeinternal(doc, type, abholer).then(function (docurl) {
                bestellungenService.purchasedoc.file(doc.id).then(function (item) {
                    vm.files[item.purchasedocid] = {pdf: item.pdf};
                })
                .catch(function(error){
                    console.log(error);
                });
                return docurl;
            });
        };
        bestellungenService.purchasedoc.files().then(function (files) {
            files.forEach(function (item) {
                vm.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
            });
        });
        console.log('Lagerausgang loaded');
    }]);