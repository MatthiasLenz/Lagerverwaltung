angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', ['$http','$timeout', '$q', '$scope',
    'stockService', 'projectService','bestellungenService','$window', '$mdDialog',
        function ($http, $timeout, $q, $scope, stockService, projectService, bestellungenService, $window, $mdDialog) {
    //ToDo: Input für Abholer und Ausgabe Polier
    var vm = this;
    $http({
         method: 'GET',
         url: '/api/01/consumedproduct/1-7800',
         data: {}
        }).then(function(response){
        vm.consumed = response;
    })
    vm.addconsumed = function(){
        $http({
            method: 'POST',
            url: '/api/01/consumedproduct/1-0110',
            data: {docdate: '2016-01-01', articles: vm.selectedProducts},
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function(response){
        vm.consumed = response;
        })
    }
    vm.deleteconsumed = function(purchasedocid){
        $http({
            method: 'DELETE',
            url: '/api/01/consumedproduct/1-0554',
            data: {purchasedocid:purchasedocid},
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function(response){
            vm.consumed = response;
        })
    }
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
    vm.queryStock = queryStock;
    vm.queryProject = queryProject;
    vm.projectDocs = [];
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    vm.getTotal = getTotal;
    vm.save = save;
    vm.make = make;
    vm.selectedProducts = [{id:0, quantity:null, article:null}];
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
            for (var i=0;i<doc.data.length;i++){
                if (doc.data[i].rowid!=rowid){
                    data.push(doc.data[i]);
                }
            }
            doc.data = data;
            vm.refresh_documents(doc);
        });
    };
    vm.refresh_documents = function (doc) {
        bestellungenService.purchasedoc.delete_documents(doc.id).then(function(){
            make(doc, 'pdf').then(function(){
                refreshDocs();
            });
        }, function(error){
            make(doc, 'pdf').then(function(){
                refreshDocs();
            });
        });
    };
    function save(){
        var articles = [];
        for(var i=0;i<vm.selectedProducts.length;i++){
            article = vm.selectedProducts[i];
            articles.push({ "rowid": null,
                "prodid": article.article.prodid.id, "name": article.article.prodid.name1,
                "unit": article.article.prodid.unit1,
                "quantity": article.quantity, "price": article.article.prodid.netpurchaseprice,
                "amount": article.quantity * article.article.prodid.netpurchaseprice});
        }
        var manager = vm.selectedProject.manager ? vm.selectedProject.manager.id : '';
        var leader =  vm.selectedProject.leader ? vm.selectedProject.leader.id : '';
        data = {
            "doctype": 3, "module": 9, "status": 4,
            "subject": vm.selectedProject.description,
            "responsible": manager,
            "leader": leader,
            "supplierid": "SOLID-SCHIEREN", // ToDo: variabel
            "modulerefid": vm.selectedProject.id,
            "docdate": vm.dt,
            "data": articles,
            "deliverynotes": []
        };
        bestellungenService.internalpurchasedoc.create(data).then(function (purchasedoc) {
            make(purchasedoc, 'pdf').then(function (response){
                refreshDocs();
                showAlert('Lagerausgang erfolgreich eingetragen.').then(function(){
                    $window.open(response.data, '_blank');
                });
            }, function(error){
                refreshDocs();
                showAlert('Lagerausgang eingetragen. Beim Erstellen des Dokuments ist ein Fehler ist aufgetreten.');
            });
            }, function(error){
                showAlert('Beim Eintragen des Lagerausgangs ist ein Fehler ist aufgetreten.');
        });
        //enter consumed product data

    }

    function getTotal(){
        var total = 0;
        for (var i=0;i<vm.selectedProducts.length;i++){
            var row=vm.selectedProducts[i];
            if (row.quantity && row.article){
                var quantity = row.quantity;
                var price = row.article.prodid.netpurchaseprice;
                var amount = quantity*price;
                total+=amount;
            }
        }
        return total;
    }
    function queryStock(query) {
        return $q(function(resolve, reject){
            stockService.articlelist_noload({
                search: query
            }).then(function(response){
                resolve(response.results);
            });
        })
    }

    function queryProject(query) {
        return $q(function(resolve, reject){
            projectService.project_list({
                search: query,
            }).then(function(response){
                resolve(response.results);
            });
        })
    }
    function searchTextChange(text) {
    }

    function selectedItemChange(item) {
        refreshDocs();
    }
    function addRow(){
        var newRowID = vm.selectedProducts.length+1;
        vm.selectedProducts.push({id: newRowID, quantity:null, article:null});
    }
    function deleteRow(rowid){
        for (var i=0; i<vm.selectedProducts.length;i++){
            if (rowid==vm.selectedProducts[i].id){
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
    function showAlert(text) {
        return $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(text)
                .textContent('')
                .ariaLabel('Benachrichtigung')
                .ok('OK')
        );
    };
    function refreshDocs(){
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 1);
        dt = dt.toISOString().slice(0, 10);
        bestellungenService.internalpurchasedoc.list({status:4, modulerefid: vm.selectedProject.id,
            min_date: dt}).then(function(data){
            vm.projectDocs = data;
        })
    }
    function make(doc, type) {
        return bestellungenService.makeinternal(doc, type).then(function (docurl) {
            bestellungenService.purchasedoc.file(doc.id).then(function (item) {
                vm.files[item.purchasedocid] = {pdf: item.pdf};
            });
            return docurl;
        });
    };
    bestellungenService.purchasedoc.files().then(function (files) {
        files.results.forEach(function (item) {
            vm.files[item.purchasedocid] = {pdf: item.pdf, doc: item.doc, odt: item.odt};
        });
    });
}]);