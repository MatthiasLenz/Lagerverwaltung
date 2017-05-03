angular.module('baseApp.lagerausgang')
    .controller('LagerausgangCtrl', ['$log', '$http', '$timeout', '$q', '$scope', 'stockService', 'projectService', 'bestellungenService',
        'staffService', 'alertService', 'sessionService','installationService',
    function ($log, $http, $timeout, $q, $scope, stockService,  projectService, bestellungenService,
              staffService, alertService, sessionService, installationService) {
        var tests;
        var vm = this;
        window.show = this;

        sessionService.getConfig().then(function (data) {
            vm.user = data;
        });
        vm.session = sessionService;
        var supplierids = {
            '01': 'SOLID-SCHIEREN',
            '02': 'LOCAL-SCHIE',
            '03': 'MJINV-SCHIE',
            '04': 'SOFIC-SCHIE',
            '05': 'SOLIB-BAU',
            '06': 'SOLID-CONST'
        };
        var supplierid = "";
        sessionService.getCompany().then(function (companyid) {
            supplierid = supplierids[companyid];
            vm.show_kleingeraete =  (companyid === "01") ? true : false;
        });
        vm.jump = function () {
            moveTop(document.getElementById("overview"));
        };
        vm.randomid = "";
        function get_randomid() {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return Math.random().toString(36).substr(2, 9);
        }

        vm.deleteconsumed = deleteconsumed;

        tests = (function () {
            return {
                p: ""
            }
        }());
        function deleteconsumed(purchasedocid) {
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
        }

        vm.selectedType="";
        installationService.getTitles().then(function(titles){
            vm.titles = titles;
        });

        vm.getMachines = getMachines;
        function getMachines(selectedType){
            if (selectedType){
                return installationService.getMachines(selectedType);
            }
            else return null;
        }

        sessionService.getCompany().then(function(companyid){
            vm.selectedCustomer = companyid;
        });

        vm.abholer = "";
        vm.searchProject = "";
        vm.searchKolonne = "";
        vm.searchStaff = "";
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
        vm.queryKolonne = queryKolonne;
        vm.projectDocs = [];
        refreshDocs();
        vm.selectedProjectChange = selectedProjectChange;
        vm.selectedKolonneChange = selectedKolonneChange;
        vm.selectedProductChange = selectedProductChange;
        vm.searchTextChange = searchTextChange;
        vm.getTotal = getTotal;
        vm.make = make;
        vm.selectedProducts = [{id: 0, quantity: null, article: null}];
        vm.selectedMachines = [{id: 0, installation: null, selectedType: ""}];
        vm.addRow = addRow;
        vm.addRowMachines = addRowMachines;
        vm.deleteRow = deleteRow;
        vm.direction = "row";

        vm.swap_direction = function () {
            if (vm.direction === "row") {
                vm.direction = "column";
            }
            else {
                vm.direction = "row";
            }
        };

        vm.edit_doc = edit_doc;
        function edit_doc(doc) {
            var temp = doc.edit;
            vm.lagerausgang.forEach(function (item) {
                item.edit = false;
            });
            doc.edit = !temp;
        }
        vm.displayPDF = "";
        vm.select_doc = select_doc;
        function select_doc(doc) {
            refreshDoc(doc).then(function(){
                vm.displayPDF = doc.pdf;
            });
            var temp = doc.select;
            //vm.projectDocs.forEach(function (item) {
            //    item.select = false;
            //});
            vm.lagerausgang.forEach(function (item) {
                item.select = false;
            });
            doc.select = !temp;
        }

        vm.save_doc = save_doc;
        function save_doc (doc) {
            doc.edit = false;
            //if all updates are started at the same time, the tokenService might not have a token yet (if the
            //user did not log in) and it will prompt the login view for each update
            var data = [];
            data = data.concat(doc.purchasedoc1.data);
            data = data.concat(doc.purchasedoc2.data);
            bestellungenService.purchasedocdata.batch_update(data).then(function () {
                refresh_documents(doc);
            });
        }


        let reverse_create_purchasedoc = function(purchasedoc){
            purchasedoc["company"] = projectService.getCompanyFromID(purchasedoc["modulerefid"]);
            bestellungenService.internalpurchasedoc.delete(purchasedoc);
        };

        let reverse_create_consumedproducts = function (purchasedoc){
            purchasedoc["company"] = projectService.getCompanyFromID(purchasedoc["modulerefid"]);
            projectService.consumedproduct_delete(purchasedoc)
                .finally(function (){
                    reverse_create_purchasedoc(purchasedoc);
                })
                .finally(function(){
                    projectService.consumedproduct_delete(purchasedoc, stock=true)
                });
        };

        let reverse_update_installation = function (purchasedoc){
            let promises = [];
            for (let i = 0; i < purchasedoc.data.length; i++) {
                let purchasedocdata = purchasedoc.data[i];
                if (purchasedocdata.projectid !== null){ //purchasedocdata.projectid entspricht hier der InstallationID
                    installationService.getMachine({id:purchasedocdata.projectid}).then(function(machine){
                        promises.push(installationService.update(purchasedocdata.projectid,
                        { availabilitystatus: machine.availabilitystatusold}));
                    });
                }
            }
        };
        let reverse_update_stockdata = function (purchasedoc){
            for (let i = 0; i < purchasedoc.data.length; i++) {
                let purchasedocdata = purchasedoc.data[i];
                if (purchasedocdata.prodid !== null){
                    stockService.stockdata_getbyprodid(purchasedocdata.prodid).then(function(response){
                        let stockdataid = response.results[0].id;
                        let new_quantity = response.results[0].quantitycur+purchasedocdata.quantity;
                        stockService.stockdata_update({id:stockdataid}, {quantitycur: new_quantity, quantityavail: new_quantity});
                    }).catch( reportProblems );
                }
            }
        };
        let reverse_create_lagerausgang = function (lagerausgangDoc){
            // reverse create_lagerausgang
            bestellungenService.lagerausgang.delete(lagerausgangDoc.id).then(function(){
                refreshDocs();
            }).catch( reportProblems );
        };
        vm.delete_doc = delete_doc;
        function delete_doc(doc) {
            alertService.showConfirm("Lagerausgang löschen?", "Löschen").then(function(){
                vm.test = Object.assign({}, doc.purchasedoc2);
                // reverse create_purchasedocs
                // reverse create_consumedproducts
                refreshDoc(doc).then(function(){
                    if (doc.purchasedocid1!==""){
                        reverse_create_consumedproducts(doc.purchasedoc1);
                    }
                    if (doc.purchasedocid2!==""){
                        reverse_create_consumedproducts(doc.purchasedoc2);
                    }
                });
                // reverse update_installation
                let promises = [];
                if (doc.purchasedoc2 !== undefined){
                    for (let i = 0; i < doc.purchasedoc2.data.length; i++) {
                        let purchasedocdata = doc.purchasedoc2.data[i];
                        if (purchasedocdata.projectid !== null){ //purchasedocdata.projectid entspricht hier der InstallationID
                            installationService.getMachine({id:purchasedocdata.projectid}).then(function(machine){
                                promises.push(installationService.update(purchasedocdata.projectid,
                                { availabilitystatus: machine.availabilitystatusold}));
                            });
                        }
                    }
                }

                $q.all(promises).catch( reportProblems );
                // reverse update_stock
                if (doc.purchasedoc1 !== undefined) {
                    for (let i = 0; i < doc.purchasedoc1.data.length; i++) {
                        let purchasedocdata = doc.purchasedoc1.data[i];
                        if (purchasedocdata.prodid !== null) {
                            stockService.stockdata_getbyprodid(purchasedocdata.prodid).then(function (response) {
                                let stockdataid = response.results[0].id;
                                let new_quantity = response.results[0].quantitycur + purchasedocdata.quantity;
                                stockService.stockdata_update({id: stockdataid}, {
                                    quantitycur: new_quantity,
                                    quantityavail: new_quantity
                                });
                            }).catch(reportProblems);
                        }
                    }
                }
                // reverse create_lagerausgang
                bestellungenService.lagerausgang.delete(doc.id).then(function(){
                    refreshDocs();
                }).catch( reportProblems );
            });
        }

        vm.delete_docdata = delete_docdata;
        function delete_docdata(doc, rowid) {
            bestellungenService.purchasedocdata.delete(rowid).then(function () {
                var data = [];
                for (var i = 0; i < doc.data.length; i++) {
                    if (doc.data[i].rowid !== rowid) {
                        data.push(doc.data[i]);
                    }
                }
                doc.data = data;
                refreshDoc(doc);
            });
        }

        vm.refresh_documents = refresh_documents;
        function refresh_documents(doc) {
            var docid = doc.id;
            vm.randomid = get_randomid();
            //alte PDF entfernen und neue PDF erstellen
            doc.pdf = '';
            bestellungenService.lagerausgang.update({id:doc.id}, {pdf:''}).then(function () {
                 return make(doc, 'pdf', vm.selectedCustomer);
            }, function (error) {
                return make(doc, 'pdf', vm.selectedCustomer);
            }).then(function(pdf){
                doc.pdf = pdf;
                vm.lagerausgang.forEach(function (item) {
                    //keep document selected after refresh
                    if (item.id == docid){
                        item.select = true;
                    }
                });
            });
        }

        vm.changeCustomer = changeCustomer;

        function changeCustomer(){
            clearPart1();
        }

        function reportProblems( fault )
        {
            $log.error( String(fault) );
            alertService.showAlert((String(fault)));
        }

        vm.save = save;
        function save() {
            if (!vm.selectedProject && !vm.selectedKolonne){
                alertService.showAlert('Bitte wählen Sie eine Baustelle oder Kolonne aus.');
                return 0;
            }
            if (!vm.selectedStaff){
                alertService.showAlert('Bitte wählen Sie einen Abholer aus.');
                return 0;
            }
            if ((vm.selectedProducts.length===0 || !vm.selectedProducts[0].article ) && (vm.selectedMachines.length==0 || vm.selectedMachines[0].selectedType=="")){
                alertService.showAlert('Keine Artikel oder Maschinen ausgewählt.'); //selectedMachines and selectedProducts empty
                return 0;
            }
            for (let i = 0; i < vm.selectedProducts.length; i++) {
                let article = vm.selectedProducts[i];
                if (article.article && !article.quantity){
                    alertService.showAlert('Bitte geben Sie die Menge für '+article.article.prodid.id+' an.');
                    return 0;
                }
            }
            var manager = vm.selectedProject && vm.selectedProject.manager ? vm.selectedProject.manager.id : '';
            var leader = vm.selectedProject && vm.selectedProject.leader ? vm.selectedProject.leader.id : '';

            // Artikel aufteilen:
            // aus selectedProducts Ressourcentyp
            //      2 an Baustelle
            //      31, 4, 41 an Kolonne (31 eigentlich direkt auf Fahrzeug/Maschine)
            // aus selectedMachines
            //      32 an Kolonne
            var articles = [];
            var project_articles = [];
            var kolonne_articles = [];
            var project_data = {};
            if (vm.selectedProducts.length>0 && vm.selectedProducts[0].article ){
                for (var i = 0; i < vm.selectedProducts.length; i++) {
                    var article = vm.selectedProducts[i];
                    var packing = article.selectedpacking.quantity!=1 ? "Verpackung: "+ article.quantity+' '+article.selectedpacking.name : "";
                    var target = kolonne_articles;
                    if (article.article.prodid.producttype == "2" || article.article.prodid.producttype == "4"){
                        target = project_articles;
                        if ( !vm.selectedProject ){
                            alertService.showAlert('Sie haben Baustoffartikel ausgewählt. Bitte wählen Sie eine Baustelle aus.');
                            return 0;
                        }
                        else if ( !project_data.data ) {
                            project_data = {
                                "doctype": 3, "module": 9, "status": 4,
                                "stockid": vm.stock.id,
                                "subject": vm.selectedProject.description,
                                "responsible": manager,
                                "leader": leader,
                                "remark": 'Lagerausgang',
                                "supplierid": supplierid,
                                "modulerefid": vm.selectedProject.id,
                                "user": vm.user.userdata.first_name + ' ' + vm.user.userdata.last_name,
                                "docdate": vm.dt,
                                "data": project_articles,
                                "deliverynotes": []
                            };
                        }
                    }
                    else if ( !vm.selectedKolonne) {
                        alertService.showAlert('Sie haben Werkzeuge oder Maschinen ausgewählt. Bitte wählen sie eine Kolonne aus.');
                        return 0;
                    }
                    target.push({
                        rowid: null,
                        prodid: article.article.prodid.id,
                        name: article.article.prodid.name1,
                        unit: article.article.prodid.unit1,
                        quantity: Math.round(article.quantity*article.selectedpacking.quantity * 1000) / 1000,
                        price: article.article.prodid.netpurchaseprice,
                        amount: article.quantity * article.article.prodid.netpurchaseprice,
                        packing: packing,
                        comment:""
                    });
                }
            }

            for (var i = 0; i < vm.selectedMachines.length; i++) {
                var item = vm.selectedMachines[i];
                var installation = item.installation;
                var article = item.selectedType.prodid;
                if (installation){
                    if ( !vm.selectedKolonne ) {
                        alertService.showAlert('Sie haben Maschinen ausgewählt. Bitte wählen sie eine Kolonne aus.');
                        return 0;
                    }
                    kolonne_articles.push({
                        rowid: null,
                        amount: article.netpurchaseprice,
                        name: installation.name1,
                        packing: "",
                        price: article.netpurchaseprice,
                        prodid: article.id,
                        quantity: 1,
                        unit: "Stk",
                        comment: (installation.id+" "+installation.name1 + (installation.chassisnum!="" ? " S/N: " + installation.chassisnum : "")).substring(0,255),
                        projectid: installation.id
                    })
                }
            }
            var kolonne_data = vm.selectedKolonne ? {
                "doctype": 3, "module": 9, "status": 4,
                "stockid": vm.stock.id,
                "subject": vm.selectedKolonne.description,
                "responsible": manager,
                "leader": leader,
                "remark": 'Lagerausgang',
                "supplierid": supplierid,
                "modulerefid": vm.selectedKolonne.id,
                "user": vm.user.userdata.first_name + ' ' + vm.user.userdata.last_name,
                "docdate": vm.dt,
                "data": kolonne_articles,
                "deliverynotes": []
                } : null;
            var project_purchasedoc = null;
            var kolonne_purchasedoc = null;
            // 1: create purchasedoc,
            // 2: create consumed product for selected projects,
            // 3: create lagerausgang doc
            // 4: make PDF document of purchasedoc

            // create_purchasedoc, create_consumed_product, makepdf
            // plan: (aber für kolonne und projekt)
            // create_Purchasedoc für kolonne und projekt parallel erzeugen

            let purchasedocs = [];
            let lagerausgangDoc;

            let create_purchasedocs = function(project_data, kolonne_data){
                let promise1 = $q.when(0), promise2 = $q.when(0);
                let purchasedoc1, purchasedoc2;
                if (project_data.data && project_data.data.length>0) promise1 = bestellungenService.internalpurchasedoc.create(project_data);
                return promise1.then(
                    function (purchasedoc){
                        purchasedoc1 = purchasedoc;
                        if (kolonne_data && kolonne_data.data.length>0) promise2 = bestellungenService.internalpurchasedoc.create(kolonne_data);
                        return promise2.then(
                            function success(purchasedoc){
                                purchasedoc2 = purchasedoc;
                                purchasedocs = [purchasedoc1, purchasedoc2];
                                return purchasedocs;
                            },
                            function error(err) {
                                reverse_create_purchasedoc(purchasedoc1);
                                return $q.reject("handled");
                            })
                    });
            };

            let create_consumedproducts = function(purchasedocs){
                //only use data from purchasedocs, no use or mutation of external state
                var purchasedoc1 = purchasedocs[0];
                var purchasedoc2 = purchasedocs[1];
                var promise1 = $q.when(0), promise2 = $q.when(0);
                if (purchasedoc1!=0) {
                    purchasedoc1["company"] = vm.selectedCustomer;
                    promise1 =  projectService.consumedproduct_createfrompurchasedoc(purchasedoc1);
                }
                return promise1.then(function(){
                    if (purchasedoc2!=0) {
                        purchasedoc2["company"] = vm.selectedCustomer;
                        promise2 =  projectService.consumedproduct_createfrompurchasedoc(purchasedoc2);
                    }
                    return promise2;
                }).then(function(){
                    if (purchasedoc1!=0) {
                        return projectService.consumedproduct_createfrompurchasedoc(purchasedoc1, true);
                    }
                    else return $q.when(0);
                }).then(function(){
                    if (purchasedoc2!=0) {
                        return projectService.consumedproduct_createfrompurchasedoc(purchasedoc2, true);
                    }
                    else return $q.when(0);
                }).then(function(){
                    return purchasedocs;
                });
            };

            let update_installation = function(purchasedocs){
                var promises = [];
                for (var i = 0; i < vm.selectedMachines.length; i++) {
                    var machine = vm.selectedMachines[i];
                    if (machine.installation !== null){
                        promises.push(installationService.update(machine.installation.id,
                            { availabilitystatus: "Benutzt in Projekt " + vm.selectedKolonne.id, availability: 0,
                            availabilitystatusold: machine.installation.availabilitystatus}));
                    }
                }
                return $q.all(promises).then(function(){
                    return purchasedocs;
                });
            };

            let create_rental = function(purchasedocs){
                //sequential calls necessary, because of duplicate key issues, should probably get fixed
                for (var i = 0; i < vm.selectedMachines.length; i++) {
                    var machine = vm.selectedMachines[i];
                    if (machine.installation !== null) {
                        promise = promise.then(installationService.create_rental(vm.selectedKolonne.id,
                            {
                                date: vm.dt,
                                installationid: machine.installation.id,
                                installationname: machine.installation.name1
                            }
                        ));
                    }
                }
                return promise.then(function(){
                    return purchasedocs;
                });
            };

            let update_stock = function(purchasedocs){
                let promises = [];
                let purchasedoc0data = (purchasedocs[0] && purchasedocs[0].data !== undefined) ? purchasedocs[0].data : [];
                let purchasedoc1data = (purchasedocs[1] && purchasedocs[1].data !== undefined) ? purchasedocs[1].data : [];
                let purchasedocdata = purchasedoc0data.concat(purchasedoc1data);
                for (let i = 0; i < purchasedocdata.length; i++) {
                    let article = purchasedocdata[i];
                    promises.push(stockService.stockdata_getbyprodid(article.prodid)
                        .then(function(response){
                            var stockdataid = response.results[0].id;
                            var new_quantity = response.results[0].quantitycur-article.quantity;
                            return stockService.stockdata_update({id:stockdataid},
                                {quantitycur: new_quantity, quantityavail: new_quantity});
                        }));
                }
                return $q.allSettled(promises).then(function(){
                     return purchasedocs;
                });
            };

            let create_lagerausgang = function(purchasedocs){
                let projectid1="", projectid2="", purchasedocid1="", purchasedocid2="";
                if (purchasedocs[0]!==0){
                    if(vm.selectedProject) projectid1 = vm.selectedProject.id;
                    purchasedocid1 = purchasedocs[0].id;
                }
                else clearProject();
                if (purchasedocs[1]!==0){
                    if(vm.selectedKolonne) projectid2 = vm.selectedKolonne.id;
                    purchasedocid2 = purchasedocs[1].id;
                }
                else clearKolonne();
                var data = {stockid:vm.stock.id,
                        projectid1: projectid1,
                        projectid2: projectid2,
                        purchasedocid1: purchasedocid1,
                        purchasedocid2: purchasedocid2,
                        docdate: vm.dt,
                        responsible: vm.user.userdata.last_name+", "+vm.user.userdata.first_name,
                        pdf: "", //wird erst später über update ergänzt
                        abholer: vm.selectedStaff.lastname+', '+vm.selectedStaff.firstname
                };
                return bestellungenService.lagerausgang.create(data).then(function(lagerausgang){
                    lagerausgang["purchasedoc1"] = purchasedocs[0];
                    lagerausgang["purchasedoc2"] = purchasedocs[1];
                    lagerausgangDoc = lagerausgang;
                    return lagerausgang;
                });
            };

            let make_pdf = function(lagerausgang){
                return make(lagerausgang, 'pdf', vm.selectedCustomer);
            };
            let finish_save = function(){
                clearPart2();
                refreshDocs().then(function(){
                    return $q.delay(200);
                }).then(function(){
                    select_doc(vm.lagerausgang[vm.lagerausgang.length-1]);
                    alertService.showAlert('Lagerausgang eingetragen.').then(function (){
                        moveTop(document.getElementById("overview"));
                    });
                });
            };
            let error_consumedproducts = function(error){
                if (purchasedocs[0].data) reverse_create_consumedproducts(purchasedocs[0]);
                if (purchasedocs[1].data) reverse_create_consumedproducts(purchasedocs[1]);
                return $q.reject("handled");
            };
            let error_installation = function(error){
                if (error!="handled"){
                    if (purchasedocs[1].data) reverse_update_installation(purchasedocs[1]);
                    error_consumedproducts(error);
                }
                return $q.reject("handled");
            };
            let error_stock = function(error){
                if (error!="handled") {
                    if (purchasedocs[0].data) reverse_update_stockdata(purchasedocs[0]);
                    if (purchasedocs[1].data) reverse_update_stockdata(purchasedocs[1]);
                    error_installation(error);
                }
                return $q.reject("handled");
            };
            let error_pdf = function(error){
                if (error!="handled") {
                    error_stock(error);
                    reverse_create_lagerausgang(lagerausgangDoc);
                }
                return $q.reject("handled");
            };
            create_purchasedocs(project_data, kolonne_data)
                .then(create_consumedproducts)
                .then(update_installation, error_consumedproducts)
                .then(update_stock, error_installation)
                .then(create_lagerausgang, error_stock)
                .then(make_pdf, error_stock)
                .then(finish_save, error_pdf)
                .catch( function(error){
                    refreshDocs();
                    reportProblems("Fehler beim Erstellen. Die Änderungen wurden rückgängig gemacht.");
                })
            //.then(create_rental)
        }
        function clear(){
            clearPart1();
	        clearPart2();
        }
        function clearProject(){
            vm.selectedProject = null;
            vm.searchProject = "";
        }
        function clearKolonne(){
            vm.selectedKolonne = null;
            vm.searchKolonne = "";
        }
        function clearPart1(){
            clearProject();
            clearKolonne();
            vm.selectedStaff = null;
            vm.searchStaff = "";
        }

        function clearPart2(){
            vm.selectedMachines = [{id: 0, installation: null, selectedType: ""}];
            vm.selectedProducts = [{id: 0, quantity: null, article: null}];
            vm.comment = "";
        }

        function getTotal() {
            var total = 0;
            for (var i = 0; i < vm.selectedProducts.length; i++) {
                var row = vm.selectedProducts[i];
                if (row.quantity && row.article) {
                    var quantity = Math.round(row.quantity*row.selectedpacking.quantity * 1000) / 1000;
                    var price = row.article.prodid.netpurchaseprice;
                    total += quantity * price;
                }
            }
            for (var i = 0; i < vm.selectedMachines.length; i++) {
                var row = vm.selectedMachines[i];
                if (row.installation && row.selectedType.prodid) {
                    total += row.selectedType.prodid.netpurchaseprice;
                }
            }
            return total;
        }
        function queryStaff(query) {
            return $q(function (resolve, reject) {
                staffService.list({
                    search: query,
                    company:vm.selectedCustomer
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
                    search: query,
                    ordering: "id"
                };
                console.log(kwargs);
                projectService.project_list(kwargs).then(function (response) {
                    resolve(response.results);
                });
            })
        }
        var kolonnenPrefix = {"01": "1-7805- ", "04": "4-7805- ", "05":  "5-7805- "};
        function queryKolonne(query) {
            console.log("queryKolone");
            console.log(vm.selectedCustomer);
            return $q(function (resolve, reject) {
                var kwargs = {
                    company: vm.selectedCustomer,
                    ordering: "id",
                    search: kolonnenPrefix[vm.selectedCustomer]+query,
                    page_size: 50
                };
                console.log(kwargs);
                projectService.project_list(kwargs).then(function (response) {
                    resolve(response.results);
                });
            })
        }

        function searchTextChange(text) {
        }

        function selectedProjectChange(item) {
            refreshDocs();
        }

        function selectedKolonneChange(item) {
            refreshDocs();
        }

        function selectedProductChange(row) {
            if (row.article!== null && typeof row.article.prodid !== "undefined" ) {
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
        function addRow(rows) {
            var newRowID = vm.selectedProducts.length + 1;
            vm.selectedProducts.push({id: newRowID, quantity: null, article: null, selectedpacking:null});
        }
        function addRowMachines() {
            var newRowID = vm.selectedMachines.length + 1;
            vm.selectedMachines.push({id: newRowID, installation: null, selectedType: ""});
        }

        function deleteRow(rows, rowid) {
            for (var i = 0; i < rows.length; i++) {
                if (rowid === rows[i].id) {
                    rows.splice(i, 1);
                }
            }
        }
        function refreshDoc(doc) {
            doc.data = [];
            var data1_promise = (doc.purchasedocid1 !== "") ? bestellungenService.internalpurchasedoc.get({id:doc.purchasedocid1}): $q.when({data:[]});
            var data2_promise = (doc.purchasedocid2 !== "")? bestellungenService.internalpurchasedoc.get({id:doc.purchasedocid2}): $q.when({data:[]});
            return data1_promise
                .then(function(purchasedoc){
                    doc.purchasedoc1 = purchasedoc;
                    return data2_promise;
                })
                .then(function(purchasedoc){
                    doc.purchasedoc2 =  purchasedoc;
                });
        }
        function refreshDocs() {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - 3);
            dt = dt.toISOString().slice(0, 10);

            if(vm.searchProject || vm.searchKolonne){
                return bestellungenService.lagerausgang.list({
                    stockid: vm.stock.id,
                    projectid1: vm.selectedProject ? vm.selectedProject.id:'',
                    projectid2: vm.selectedKolonne ? vm.selectedKolonne.id:'',
                    min_date: dt
                }).then(function (data) {
                    vm.lagerausgang = data;
                })
                .catch(function(error){
                    console.log(error);
                })
            }
            else{
                vm.lagerausgang = null;
                return $q.when(null);
            }
        }

        function make(doc, type, kunde) {
            return bestellungenService.makeinternal(doc, type, kunde).then(function (docurl) {
                var url = docurl.data;
                return bestellungenService.lagerausgang.update({id:doc.id}, {pdf: url}).then(function(){
                    return url;
                });
            });
        }

        bestellungenService.purchasedoc.files().then(function (files) {
            files.forEach(function (item) {
                vm.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
            });
        });
        console.log('Lagerausgang loaded');
    }])
    .config(['$provide', function ($provide) {
        $provide.decorator('$q', ['$delegate', function ($delegate) {
            var $q = $delegate;

            $q.allSettled = $q.allSettled || function allSettled(promises) {
                // Implementation of allSettled function from Kris Kowal's Q:
                // https://github.com/kriskowal/q/wiki/API-Reference#promiseallsettled

                var wrapped = angular.isArray(promises) ? [] : {};

                angular.forEach(promises, function(promise, key) {
                    if (!wrapped.hasOwnProperty(key)) {
                        wrapped[key] = wrap(promise);
                    }
                });

                return $q.all(wrapped);

                function wrap(promise) {
                    return $q.when(promise)
                        .then(function (value) {
                            return { state: 'fulfilled', value: value };
                        }, function (reason) {
                            return { state: 'rejected', reason: reason };
                        });
                }
            };

            $q.delay = $q.delay || function delay(ms) {
                var deferred = $q.defer();
                setTimeout(deferred.resolve, ms);
                return deferred.promise;
            };
            return $q;
        }]);
    }])
    .directive('scrollOnClick', function() {
      return {
        restrict: 'A',
        link: function(scope, elm) {
            elm.on('click', function() {
                window.show.elm = elm[0].offsetTop;
                moveTop(elm[0]);
                //$("body").animate({scrollTop: $elm.offset().top}, "slow");
            });
        }
      }
    });

function moveTop(element){
    function findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        return [curtop];
        }
    }
    window.scroll(0,findPos(element));
}
