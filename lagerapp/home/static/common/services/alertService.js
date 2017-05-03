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
    function showConfirm(question, actiontext) {
        var confirm = $mdDialog.confirm()
              .title(question)
              .textContent('Achtung: Diese Aktion kann nicht rückgängig gemacht werden.')
              .ariaLabel('Bestätigung')
              .ok(actiontext)
              .cancel('Abbrechen');
        return $mdDialog.show(confirm);
    }
    return {
        showAlert: showAlert,
        showConfirm: showConfirm,
        showTemplate: showTemplate
    };
});