angular.module('baseApp')
.directive('headContent', function () {
    var controller = ['tokenService', '$http', function (tokenService, $http, sessionService) {
        var vm = this;
        vm.title = 'Lagerverwaltung';
    }];

    return {
        templateUrl: 'static/common/directives/head.html',
        controller: controller,
        controllerAs: 'head'
    }
})
.directive('ellipsis', function () {
    var controller = ['utilityService', function (utilityService) {
        this.dots = utilityService.dots;
    }];

    return {
        restrict: "E",
        template: "{{ ellipsis.dots.value }}",
        controller: controller,
        controllerAs: 'ellipsis'
    }
});

