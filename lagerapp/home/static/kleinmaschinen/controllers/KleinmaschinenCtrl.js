angular.module('baseApp.kleinmaschinen')
.controller('KleinmaschinenCtrl', ['installationService', '$cacheFactory', 'alertService',
    function (installationService, $cacheFactory, alertService) {
    var vm = this;
    console.log('Kleinmaschinen Controller geladen');

    vm.machines = installationService.machines;
    vm.search = "15-001-0";
    var projectRegex = /([0-9]{1}-[0-9]{4})(-([0-9]{1,2})|)/;
    vm.select = select;
    function select(machine){
        var temp = machine.select || false;
        vm.machines.forEach(function (item) {
            item.select = false;
        });
        machine.select = !temp;
    }
    vm.extractProject = extractProject;
    function extractProject(str){
        let result = "";
        if (str !== null){
            let match = str.match(projectRegex);
            if (match !== null) result = match[0];
        }
        return result;
    }
    vm.reset = reset;
    function reset(machine){
        alertService.showConfirm(machine.id+" zurück auf das Lager setzen?", "Ja").then(function(){
            let new_status = "Benutzt in Projekt " + "1-7800";
            installationService.update(machine.id, { availabilitystatus: new_status,
                availability: 1, availabilitystatusold: machine.availabilitystatus});
            machine.availabilitystatus = new_status;
        });
    }

    installationService.getTitles().then(function(titles){
        vm.titles = titles;
    });
}]);