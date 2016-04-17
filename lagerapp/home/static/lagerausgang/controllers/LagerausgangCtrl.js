angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', ['$timeout', '$q', '$scope', 'stockService','sessionService',
    function ($timeout, $q, $scope, stockService, sessionService) {
    var vm = this;
    this.stockid = sessionService.getStock();
    sessionService.subscribeStockIDChange($scope, function () {
        vm.resetAndUpdate();
    });

    vm.simulateQuery = false;
    vm.isDisabled = false;

    // list of `state` value/display objects
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;

    vm.direction = "row";
    vm.swap_direction = function () {
        if (vm.direction == "row") {
            vm.direction = "column";
        }
        else {
            vm.direction = "row";
        }
    };
    function querySearch(query) {
        return $q(function(resolve, reject){
            stockService.articlelist({
                ordering: vm.ordering,
                page: vm.page,
                page_size: vm.perPage,
                search: query,
                prodid__nature: vm.resourcenatureid,
                stockid: sessionService.getStock()
            }).then(function(response){
                resolve(response.results);
            });
        })
    }

    function searchTextChange(text) {

    }

    function selectedItemChange(item) {

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