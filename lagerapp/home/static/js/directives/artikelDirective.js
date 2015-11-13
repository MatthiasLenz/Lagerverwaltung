angular.module('baseApp').
directive('artikelDirective', function () {
    return {
        scope: {
            info: '=testattr'
        },
        templateUrl: 'static/html/articlelist.html',
        controller: 'ArtikelCtrl',
        controllerAs: 'artikel'
    };
});
