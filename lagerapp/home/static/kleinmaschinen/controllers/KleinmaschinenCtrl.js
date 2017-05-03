angular.module('baseApp.kleinmaschinen').controller('KleinmaschinenCtrl', ['$http', '$timeout', '$q', '$scope', 'installationService',
    'stockService', 'projectService', 'bestellungenService', 'staffService', '$window', 'alertService', 'sessionService',
    function ($http, $timeout, $q, $scope, installationService, stockService,  projectService, bestellungenService,
              staffService, $window, alertService, sessionService) {
        var vm = this;
        window.show = this;
        var supplierids = {'01':'SOLID-SCHIEREN','02':'LOCAL-SCHIE','03':'MJINV-SCHIE','04':'SOFIC-SCHIE','05':'SOLIB-BAU','06':'SOLID-CONST'};
        var supplierid = "";
        sessionService.getCompany().then(function(companyid){
            supplierid = supplierids[companyid];
        });
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
        vm.selectedType="";
        installationService.getTitles().then(function(titles){
            vm.titles = titles;
        });
        vm.getMachines = function(selectedType){
            return installationService.getMachines(selectedType);
        };

        sessionService.getCompany().then(function(companyid){
            vm.selectedCustomer = companyid;
        });

        vm.abholer = "";
        vm.searchProject = "";
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
        refreshDocs();
        vm.selectedProjectChange = selectedProjectChange;
        vm.selectedProductChange = selectedProductChange;
        vm.searchTextChange = searchTextChange;
        vm.getTotal = getTotal;
        vm.save = save;
        vm.selectedMachines = [{id: 0, installation: null, selectedType: ""}];
        vm.make = make;
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
                refreshDocs();
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
                    refreshDocs();
                });
            }, function (error) {
                make(doc, 'pdf', doc.remark).then(function () {
                    refreshDocs();
                });
            });
        };
        vm.changeCustomer = changeCustomer;
        function changeCustomer(){

        }
        function save() { //vm.selectedmachines is undefined
            if (!vm.selectedProject){
                alertService.showAlert('Bitte wählen Sie eine Kolonne aus.');
                return 0;
            }
            if (vm.selectedMachines.length == null){
                alertService.showAlert('Kein Gerät ausgewählt.');
                return 0;
            }
            var manager = vm.selectedProject.manager ? vm.selectedProject.manager.id : '';
            var leader = vm.selectedProject.leader ? vm.selectedProject.leader.id : '';
            var machinedata = [];
            vm.selectedMachines.forEach(function(item){
                var installation = item.installation;
                var rpdresid = installation.rentperdayresourceid;
                var prodid = rpdresid==null ? rpdresid.substr(rpdresid.lastIndexOf('/') + 1) : "V-12-9001";
                machinedata.push({
                    rowid: null,
                    amount: installation.purchasevalue,
                    name: installation.name1,
                    packing: "",
                    price: installation.purchasevalue,
                    prodid: prodid,
                    quantity: 1,
                    unit: "",
                    comment: installation.id+" "+installation.name1 + (installation.chassisnum!="" ? " S/N: " + installation.chassisnum : ""),
                    chassisnum: installation.chassisnum
                })
            });

            data = {
                "doctype": 3, "module": 9, "status": 4,
                "stockid": vm.stock.id,
                "subject": vm.selectedProject.description,
                "responsible": manager,
                "leader": leader,
                "remark": vm.abholer,
                "supplierid": supplierid,
                "modulerefid": vm.selectedProject.id,
                "docdate": vm.dt,
                "data": machinedata,
                "deliverynotes": []
            };
            var purchasedoc = null;
            var pdfurl = null;
            var pdf = null;
            //1: create purchasedoc, 2: create consumed product for selected project, 3: make PDF document of purchasedoc
            bestellungenService.internalpurchasedoc.create(data)    //create purchasedoc entry
                .then(  //patch installation for each selected machine
                    function(response) { /*success:*/
                        purchasedoc = response;
                        var update_promises = [];
                        vm.selectedMachines.forEach(function(item){
                            update_promises.push(installationService.update(item.installation.id,
                                { availabilitystatus: "Benutzt in Projekt " + vm.selectedProject.id, availability: 0 }));
                        });
                        return $q.all(update_promises);
                },
                    function(error) { /*error:*/
                    return $q.reject("purchasedoc_error"); }
                )
                .then(  //make pdf
                    function(response) { /*success:*/
                        pdfurl = response;
                        return make(purchasedoc, 'pdf', purchasedoc.remark);
                },
                    function(error) { /*error:*/
                    return $q.reject("patchinstallation_error"); }
                )
                .then(  //create rental for each selected machine
                    function(response) { /*success:*/
                        pdf = response;
                        var update_promises = [];
                        vm.selectedMachines.forEach(function(item){
                            update_promises.push(installationService.create_rental(vm.selectedProject.id,
                                {date: vm.dt, installationid: item.installation.id, installationname: item.installation.name1}
                            ));
                        });
                        return $q.all(update_promises);
                },
                    function(error) { /*error:*/
                    return $q.reject("makepdf_error"); }
                )
                .then(  //finish
                    function(response) { /*success:*/
                        refreshDocs();
                        clear();
                        alertService.showAlert('Geräteausgabe erfolgreich eingetragen.').then(function () {
                            $window.open(pdf.data, '_blank');
                        });
                    },
                    function(error) { /*error:*/
                        switch (error){
                            case "purchasedoc_error":
                                alertService.showAlert('Fehler beim Erstellen der Bestellung');
                                break;
                            case "patchinstallation_error":
                                alertService.showAlert('Bestellung eingetragen. Fehler beim Eintragen der Projektreferenz im Gerät.');
                                break;
                            case "makepdf_error":
                                alertService.showAlert('Bestellung eingetragen. Fehler beim Erstellen des Dokuments.');
                                break;
                            default:
                                alertService.showAlert('Bestellung eingetragen. Fehler beim Erstellen des Verleihs.');
                                refreshDocs();
                                break;
                        }
                        return $q.reject("make_error");
                    }
                )
        }
        function clear(){
            vm.selectedMachine = null;
            vm.selectedMachines = [{id: 0, installation: null, selectedType: ""}];
            vm.abholer = "";
            vm.searchAbholer = "";
        }
        function getTotal() {
            var total = 0;
            for (var i = 0; i < vm.selectedMachines.length; i++) {
                var row = vm.selectedMachines[i];
                if (row.installation && row.installation.purchasevalue) {
                    total += row.installation.purchasevalue;
                }
            }
            return total;
        }
        function queryStaff(query) {
            return $q(function (resolve, reject) {
                staffService.list({
                    search: query
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
            console.log("queryProject");
            console.log(vm.selectedCustomer);
            return $q(function (resolve, reject) {
                var kwargs = {
                    company: vm.selectedCustomer,
                    search: "Kolonne "+query
                };
                console.log(kwargs);
                projectService.project_list(kwargs).then(function (response) {
                    resolve(response.results);
                });
            })
        }

        //Mock für Gerätetypauswahl
        vm.machineTypes = loadAll();
        vm.queryType = queryType;
        vm.simulateQuery = true;
        vm.types;
        function queryType (query) {
          var results = query ? vm.machineTypes.filter( createFilterFor(query) ) : vm.machineTypes,
              deferred;
          if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
          } else {
            return results;
          }
        }
        function loadAll() {
          var allTypes = '001:Nivelliergeräte, 002:Rotationslaser, 004:Umformer, 005:Rüttelflaschen, 007:Bohrhammer,\ ' +
              '008:Stemmhammer';

          return allTypes.split(/, +/g).map( function (item) {
            return {

              value: item.split(/:+/g)[0],
              display: item.split(/:+/g)[1]
            };
          });
        }

        /**
         * Create filter for mock data
         */
        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);

          return function filterFn(item) {
            return (item.value.indexOf(lowercaseQuery) === 0);
          };

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
        vm.show=vm.selectedMachines;
        function addRow() {
            var newRowID = vm.selectedMachines.length + 1;
            vm.selectedMachines.push({id: newRowID, installation: null, selectedType: ""});
        }

        function deleteRow(rowid) {
            for (var i = 0; i < vm.selectedMachines.length; i++) {
                if (rowid == vm.selectedMachines[i].id) {
                    vm.selectedMachines.splice(i, 1);
                }
            }
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

        function make(doc, type, abholer) {
            return bestellungenService.makekleingeraete(doc, type, abholer).then(function (docurl) {
                bestellungenService.purchasedoc.file(doc.id).then(function (item) {
                    vm.files[item.purchasedocid] = {pdf: item.pdf};
                })
                .catch(function(error){
                    console.log(error);
                });
                return docurl;
            });
        }
        bestellungenService.purchasedoc.files().then(function (files) {
            files.forEach(function (item) {
                vm.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
            });
        });
        console.log('Kleinmaschinen Controller geladen');
    }]);