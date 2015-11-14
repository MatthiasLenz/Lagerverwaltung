angular.module('baseApp').
directive('artikelDirective', function () {
    return {
        restrict: 'A',
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/html/articlelist.html',
        controller: 'ArtikelCtrl',
        controllerAs: 'artikel'
    };
});
