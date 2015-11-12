angular.module('baseApp').
controller('ArtikelCtrl', ['$scope', '$injector', function ($scope, $injector) {
    // 1. Self-reference
    var controller = this;

    // 2. requirements
    var natureService = $injector.get('natureService');
    var productService = $injector.get('productService');

    // 3. Do scope stuff
    // 3a. Set up watchers on the scope.
    $scope.$watchCollection('[artikel.page,artikel.ordering]', function (newVal, oldVal) {
        updateList(false);
    });
    $scope.$watchCollection('[artikel.query,artikel.resourcenatureid,artikel.perPage]', function () {
        //search and filter operations change the resulting size
        updateList(true);
    });

    // 3b. Expose methods or data on the scope
    $scope.productModel = productService.model;
    window.scope = controller;
    window.scope2 = $scope;

    // 3c. Listen to events on the scope

    // 4. Expose methods and properties on the controller instance
    for (var key in productService.model) {
        if (!(key in controller)) {
            controller[key] = productService.model[key];
        }
    }
    this.resourcenatureids = [{"id": "", "name": "- Bitte auswählen -", "title": ""}];
    this.sortDirection = 'sort-caret desc';
    this.updateList = updateList;
    this.nextPage = nextPage;
    this.previousPage = previousPage;
    this.setPage = setPage;
    this.setOrder = setOrder;
    this.getOrder = getOrder;

    // 5. Clean up
    $scope.$on('$destroy', function () {
        // Do whatever cleanup might be necessary
        controller = null; // MEMLEAK FIX
        $scope = null; // MEMLEAK FIX
    });

    // 6. All the actual implementations go here. 
    natureService.query().$promise.then(function (result) {
        var titleDescr = "";
        result.forEach(function (item) {
            if (item.title) {
                titleDescr = item.name;
            }
            else {
                controller.resourcenatureids.push({"id": item.id, "name": item.name, "title": titleDescr});
            }
        });
    });

    function updateList(resetPage) {
        /*var query = controller.query+" in:title repo:angular/angular.js";*/
        var query = controller.query;
        controller.page = resetPage ? 1 : controller.page;
        productService.query({
            ordering: controller.ordering,
            page: controller.page,
            page_size: controller.perPage,
            search: query,
            resourcenatureid: controller.resourcenatureid
        }, function (data) {
            controller.items = data.results;
            controller.lastPage = Math.ceil(data.count / controller.perPage);
        });
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