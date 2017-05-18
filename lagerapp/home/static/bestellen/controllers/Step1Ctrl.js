angular.module('baseApp.bestellen').
controller('Step1Ctrl', ['$scope', '$injector', function ($scope, $injector) {
    // 1. Self-reference
    var vm = this;
    // 2. requirements
    var natureService = $injector.get('natureService');
    var stockService = $injector.get('stockService');
    var sessionService = $injector.get('sessionService');
    stockService.stockinfo({})
        .then(function (data) {
            var stockinfo = data.results;
            //Transform into HashMap
            vm.stockinfo = {};
            for (i=0;i<stockinfo.length;i++){
                var id = stockinfo[i].id;
                vm.stockinfo[id] = stockinfo[i];
            }
        });
    // 3b. Expose methods or data on the scope
    $scope.productModel = stockService.model;
    $scope.solid = "Solid S.A.";

    // 3c. Listen to events on the scope

    // 4. Expose methods and properties on the controller instance
    for (var key in stockService.model) {
        if (!(key in vm)) {
            vm[key] = stockService.model[key];
        }
    }
    vm.stockid = sessionService.getStock();
    sessionService.subscribeStockIDChange($scope, function () {
        vm.resetAndUpdate();
    });
    vm.resourcenatureids = natureService.stocknature_list;
    vm.sortDirection = 'sort-caret desc';
    vm.updateList = updateList;
    vm.resetAndUpdate = function () {
        resetPage();
        updateList();
    };
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.setPage = setPage;
    vm.setOrder = setOrder;
    vm.getOrder = getOrder;
    vm.query = '';
    vm.items = [];
    vm.setOrder("ID"); //default
    // 5. Clean up
    $scope.$on('$destroy', function () {
        // Do whatever cleanup might be necessary
        vm = null; // MEMLEAK FIX
        $scope = null; // MEMLEAK FIX
    });

    // 6. All the actual implementations go here.
    updateList();
    function updateList() {
        /*var query = vm.query+" in:title repo:angular/angular.js";*/
        var query = vm.query;
        stockService.articlelist({
            ordering: vm.ordering,
            page: vm.page,
            page_size: vm.perPage,
            search: query,
            prodid__nature: vm.resourcenatureid,
            stockid: sessionService.getStock()
        }).then(function (data) {
            vm.items = data.results;
            vm.lastPage = Math.ceil(data.count / vm.perPage);
        });
    }

    function resetPage() {
        vm.page = 1;
        updateList();
    }
    function nextPage() {
        if (vm.lastPage !== vm.page) {
            vm.page++;
        }
        updateList();
    }

    function previousPage() {
        if (vm.page !== 1) {
            vm.page--;
        }
        updateList();
    }

    function setPage(num) {
        if (num <= vm.lastPage && num > 0) {
            vm.page = num;
        }
    }

    function setOrder(field) {
        if (vm.ordering == field) {
            vm.ordering = '-' + vm.ordering;
            vm.sortorder = 'desc';
        }
        else {
            vm.ordering = field;
            vm.sortorder = 'asc';
        }
        sortDirection();
        updateList();
    }

    function getOrder() {
        if (vm.ordering.charAt(0) == '-') {
            return vm.ordering.substr(1, vm.ordering.length);
        }
        else return vm.ordering;
    }

    function sortDirection() {
        if (vm.ordering.charAt(0) == '-') {
            vm.sortDirection = 'sort-caret desc';
        } else vm.sortDirection = 'sort-caret asc';
    }

}]);

/*controller.productAll = Product.query();
 controller.productAll.$promise.then(function (result) {
 controller.productAll = result;
 });*/