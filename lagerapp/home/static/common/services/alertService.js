angular.module('baseApp.Services').
factory("alertService", function ($mdDialog) {
    function showAlert(text) {
        return $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(text)
                .textContent(text.data)
                .ariaLabel('Benachrichtigung')
                .ok('OK')
        );
    }
    function showTemplate(text) {
        return $mdDialog.show({template:text});
    }

    return {
        showAlert: showAlert,
        showTemplate: showTemplate
    };
});