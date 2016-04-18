angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', ['$timeout', '$q', '$scope', 'stockService',
    'projectService', function ($timeout, $q, $scope, stockService, projectService) {
    var vm = this;

    vm.simulateQuery = false;
    vm.isDisabled = false;

    // list of `state` value/display objects
    vm.queryStock = queryStock;
    vm.queryProject = queryProject;
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