angular.module('baseApp').
directive('headContent', function () {
    var controller = ['tokenService', '$http', function (tokenService, $http) {
        var vm = this;
        vm.companylogo="";
        tokenService.getToken()
        .then(function (tokendata) {
            return $http({
                method: 'GET',
                url: '/api/companylogo',
                dataType: 'json',
                headers: {
                    "Authorization": "Token " + tokendata.token,
                    "Content-Type": "application/json"
                }
            })
        })
        .then(function (response) {
            vm.companylogo = response.data.logourl;
        })
        .catch(function (err) {
            alert("Error");
        });

        vm.title = 'Lagerverwaltung';
    }];

    return {
        templateUrl: 'static/common/directives/head.html',
        controller: controller,
        controllerAs: 'head'
    }
});
