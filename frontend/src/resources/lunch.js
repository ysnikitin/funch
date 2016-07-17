angular.module('funch').factory('Lunch', function ($resource) {
    return $resource('/lunch/:id', {}, {
        active: {
            method: 'GET'
        },
        email: {
            method: 'POST'
        }
    });
});
