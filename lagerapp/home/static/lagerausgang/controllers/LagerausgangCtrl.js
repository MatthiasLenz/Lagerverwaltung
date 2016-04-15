angular.module('baseApp.lagerausgang').controller('LagerausgangCtrl', [function ($timeout, $q) {
    var vm = this;
    vm.simulateQuery = false;
    vm.isDisabled = false;

    // list of `state` value/display objects
    vm.states = loadAll();
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;

    vm.newState = newState;

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
        var results = query ? vm.states.filter(createFilterFor(query)) : vm.states,
            deferred;
        if (vm.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(results);
            }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange(text) {

    }

    function selectedItemChange(item) {

    }

    function loadAll() {
        var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
            Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
            Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
            Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
            North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
            South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
            Wisconsin, Wyoming';

        return allStates.split(/, +/g).map(function (state) {
            return {
                value: state.toLowerCase(),
                display: state
            };
        });
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }
    function newState(state) {
        alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }
}]);