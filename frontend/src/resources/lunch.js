angular.module('funch').factory('Lunch', function ($resource, $http) {
    var l = $resource('/lunch/:id', {
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

    l.prototype.getUserHash = function (userId) {
        return $http.get('/lunch/' + this.id + '/user/' + userId + '/hash').then(function (d) {
            return d.data.hash;
        })
    };

    return l;
});
