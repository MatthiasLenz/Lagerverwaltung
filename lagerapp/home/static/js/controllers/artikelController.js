angular.module('baseApp').
controller('ArtikelCtrl', ['$scope', '$resource', 'Nature', 'productService', function ($scope, $resource, Nature, productService) {
    var vm = this;
    $scope.productModel = productService.model;
    vm.product = productService;
    for (var key in productService.model) {
        if (vm[key] == null) {
            vm[key] = productService.model[key];
        }
    }
    //Since ControllerAs is 'artikel' -> $scope.artikel is the same as this
    window.scope = vm;
    window.scope2 = $scope;
    /*vm.productAll = Product.query();
     vm.productAll.$promise.then(function (result) {
        vm.productAll = result;
     });*/
    vm.resourcenatureids = [{"id": "", "name": "- Bitte auswählen -", "title": ""}];

    var nature = Nature.query();
    nature.$promise.then(function (result) {
        var titleDescr = "";
        nature.forEach(function (item, index, array) {
            if (item.title) {
                titleDescr = item.name;
            }
            else {
                vm.resourcenatureids.push({"id": item.id, "name": item.name, "title": titleDescr});
            }
        });
    });
    //vm.test1 = Nature.get({'id': '90230000'});

    vm.updateList = function (resetPage) {
        /*var query = vm.query+" in:title repo:angular/angular.js";*/
        var query = vm.query;
        vm.page = resetPage ? 1 : vm.page;
        productService.query({
            ordering: vm.ordering,
            page: vm.page,
            page_size: vm.perPage,
            search: query,
            resourcenatureid: vm.resourcenatureid
        }, function (data) {
            vm.items = data.results;
            vm.lastPage = Math.ceil(data.count / vm.perPage);
        });
    };
    $scope.$watchCollection('[artikel.page,artikel.ordering]', function (newVal, oldVal) {

        vm.updateList(false);
    });
    $scope.$watchCollection('[artikel.query,artikel.resourcenatureid,artikel.perPage]', function () {
        //search and filter operations change the resulting size
        vm.updateList(true);
    });

    vm.nextPage = function () {
        if (vm.lastPage !== vm.page) {
            vm.page++;
        }
    };
    vm.previousPage = function () {
        if (vm.page !== 1) {
            vm.page--;
        }
    };
    vm.setPage = function (num) {
        if (num <= vm.lastPage && num > 0) {
            vm.page = num;
        }
    };
    vm.setOrder = function (field) {
        if (vm.ordering == field) {
            vm.ordering = '-' + vm.ordering;
            vm.sortorder = 'desc';
        }
        else {
            vm.ordering = field;
            vm.sortorder = 'asc';
        }
    };
    vm.getOrder = function () {
        if (vm.ordering.charAt(0) == '-') {
            return vm.ordering.substr(1, vm.ordering.length);
        }
        else return vm.ordering;
    };
    vm.sortDirection = function (field) {
        if (vm.ordering.charAt(0) == '-') {
            return 'sort-caret desc';
        } else return 'sort-caret asc';
    };


}]);