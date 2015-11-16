angular.module('baseApp').
directive('headContent', function () {
    return {
        templateUrl: 'static/common/directives/head.html',
        controller: [function () {
            this.title = 'Lagerverwaltung';
        }],
        controllerAs: 'head'
    }
});
