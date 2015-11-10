angular.module('baseApp.Services', ['ngResource']).
factory("Nature", function ($resource) {
    return $resource(
        "/api/nature/:id", {id: "@id"}, {
            "reviews": {
                'method': 'GET',
                'params': {'reviews_only': "true"},
                isArray: true
            }
        }
    );
});
