angular.module('funch').factory('Lunch', function ($resource) {
    return $resource('/lunch/:id', {
        id: '@id'
    }, {
        active: {
            method: 'GET',
            url: '/lunch/:id/active'
        },
        email: {
            method: 'POST'
        },
        update: {
            method: 'PUT',
            transformRequest: function (a) {
                delete a.$promise;
                delete a.$resolved;
                delete a.id;
                delete a.onduty;
                return angular.toJson(a);
            }
        }
    });
});
