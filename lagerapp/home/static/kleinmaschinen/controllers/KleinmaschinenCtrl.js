angular.module('baseApp.kleinmaschinen').controller('KleinmaschinenCtrl', ['installationService',
    function (installationService) {
        var vm = this;

        console.log('Kleinmaschinen Controller geladen');

        vm.machines = installationService.machines;
        vm.search = "15-001-0";

        installationService.getTitles().then(function(titles){
            vm.titles = titles;
        });
    }]);