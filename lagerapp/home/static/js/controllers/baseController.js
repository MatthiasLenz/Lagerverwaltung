angular.module('baseApp').
controller('BaseCtrl', function () {
    var vm = this;
    vm.title = 'Artikel Stammdaten';
    vm.tabs = [{title: 'Artikel Stammdaten', url: 'artikel'},
        {title: 'Bestellmodul', url: 'bestellmodul'},
        {title: 'Lagereingang', url: 'lagereingang'},
        {title: 'Lagerausgang', url: 'lagerausgang'},
        {title: 'Lagerverwaltung', url: 'lagerverwaltung'},
        {title: 'Verrechnungen', url: 'verrechnungen'}];
    vm.currentTab = 'artikel';
    vm.onClickTab = function (tab) {
        vm.currentTab = tab.url;
        vm.title = tab.title;
    }
    vm.isActiveTab = function (tabUrl) {
        return tabUrl == vm.currentTab;
    }
});