angular.module('artikelApp').
controller('BestellungCtrl', function ($scope, $resource) {
    var vm = this;
    vm.article = "";
    vm.supplier = "";
    vm.date = "";
    vm.amount = "";
    vm.projectid = "";
    vm.baustelle = "Musterbaustelle";
    vm.bauleiter = "Mustermann";
    var product = $resource(
        '/api/product/:id',
        {per_page: 20, q: ""},
        {query: {method: 'GET', isArray: false}}
    );
    $scope.$watchCollection('[bst.article]', function () {

    });
});