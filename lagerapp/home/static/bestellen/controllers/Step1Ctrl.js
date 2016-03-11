angular.module('baseApp.bestellen').
controller('Step1Ctrl', ['$scope', '$injector', function ($scope, $injector) {
    // 1. Self-reference
    var controller = this;

    // 2. requirements
    var natureService = $injector.get('natureService');
    var stockService = $injector.get('stockService');
    var sessionService = $injector.get('sessionService');
    // 3. Do scope stuff
    // 3b. Expose methods or data on the scope
    $scope.productModel = stockService.model;
    $scope.solid = "Solid S.A.";

    // 3c. Listen to events on the scope

    // 4. Expose methods and properties on the controller instance
    for (var key in stockService.model) {
        if (!(key in controller)) {
            controller[key] = stockService.model[key];
        }
    }
    this.stockid = sessionService.getStock();
    sessionService.subscribeStockIDChange($scope, function () {
        controller.resetAndUpdate();
    });
    this.resourcenatureids = natureService.nature_list;
    this.sortDirection = 'sort-caret desc';
    this.updateList = updateList;
    this.resetAndUpdate = function () {
        resetPage();
        updateList();
    };
    this.nextPage = nextPage;
    this.previousPage = previousPage;
    this.setPage = setPage;
    this.setOrder = setOrder;
    this.getOrder = getOrder;
    this.query = '';
    this.items = [];
    // 5. Clean up
    $scope.$on('$destroy', function () {
        // Do whatever cleanup might be necessary
        controller = null; // MEMLEAK FIX
        $scope = null; // MEMLEAK FIX
    });

    // 6. All the actual implementations go here.
    updateList();
    function updateList() {
        /*var query = controller.query+" in:title repo:angular/angular.js";*/
        var query = controller.query;
        stockService.articlelist({
            ordering: controller.ordering,
            page: controller.page,
            page_size: controller.perPage,
            search: query,
            prodid__nature: controller.resourcenatureid,
            stockid: sessionService.getStock()
        }).then(function (data) {
            controller.items = data.results;
            controller.lastPage = Math.ceil(data.count / controller.perPage);
        });

    }

    function resetPage() {
        controller.page = 1;
    }
    function nextPage() {
        if (controller.lastPage !== controller.page) {
            controller.page++;
        }
    }

    function previousPage() {
        if (controller.page !== 1) {
            controller.page--;
        }
    }

    function setPage(num) {
        if (num <= controller.lastPage && num > 0) {
            controller.page = num;
        }
    }

    function setOrder(field) {
        if (controller.ordering == field) {
            controller.ordering = '-' + controller.ordering;
            controller.sortorder = 'desc';
        }
        else {
            controller.ordering = field;
            controller.sortorder = 'asc';
        }
        sortDirection();
        updateList();
    }

    function getOrder() {
        if (controller.ordering.charAt(0) == '-') {
            return controller.ordering.substr(1, controller.ordering.length);
        }
        else return controller.ordering;
    }

    function sortDirection() {
        if (controller.ordering.charAt(0) == '-') {
            controller.sortDirection = 'sort-caret desc';
        } else controller.sortDirection = 'sort-caret asc';
    }

}]);

/*controller.productAll = Product.query();
 controller.productAll.$promise.then(function (result) {
 controller.productAll = result;
 });*/