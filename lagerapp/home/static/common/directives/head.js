angular.module('baseApp').
directive('headContent', function () {
    var controller = ['tokenService', '$http', function (tokenService, $http, sessionService) {
        var vm = this;
        vm.title = 'Lagerverwaltung';
    }];

    return {
        templateUrl: 'static/common/directives/head.html',
        controller: controller,
        controllerAs: 'head'
    }
});
