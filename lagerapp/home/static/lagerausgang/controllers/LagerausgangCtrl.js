angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', ['$http','$timeout', '$q', '$scope', 'stockService',
    'projectService','bestellungenService','$window', '$mdDialog',
    function ($http, $timeout, $q, $scope, stockService, projectService, bestellungenService, $window, $mdDialog) {
    var vm = this;

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
    bestellungenService.internalpurchasedoc.list({status:0}).then(function(data){
        vm.internalpurchasedocs = data;
    })
    stockService.currentStock({})
        .then(function (data) {
            vm.stock = data;
        });
    // list of `state` value/display objects
    vm.queryStock = queryStock;
    vm.queryProject = queryProject;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    vm.getTotal = getTotal;
    vm.save = save;
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
        bestellungenService.internalpurchasedoc.create(data).then(function (response) {
            showAlert('Lagerausgang erfolgreich eingetragen.');
            $http({
                method: 'POST',
                url: '/api/01/lagerausgangmakepdf',
                data: { type: "pdf", docdate: vm.dt, project: vm.selectedProject, items:vm.selectedProducts, stock: vm.stock.name}
                }).then(function successCallback(response) {
                 $window.open(response.data, '_blank');
                }, function errorCallback(response) {
            });
        }, function(error){
            showAlert('Ein Fehler ist aufgetreten.');
        });
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
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(text)
                .textContent('')
                .ariaLabel('Benachrichtigung')
                .ok('OK')
        );
    };
}]);