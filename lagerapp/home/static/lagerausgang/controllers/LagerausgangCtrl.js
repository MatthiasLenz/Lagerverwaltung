angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', ['$timeout', '$q', '$scope', 'stockService',
    'projectService', function ($timeout, $q, $scope, stockService, projectService) {
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
    // list of `state` value/display objects
    vm.queryStock = queryStock;
    vm.queryProject = queryProject;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    vm.getTotal = getTotal;
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
}]);