angular.module('funch').factory('Lunch', function ($resource, $http) {
    var l = $resource('/lunch/:id', {
        id: '@id'
    }, {
        active: {
            method: 'GET',
            url: '/lunch/:id/active'
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

    l.prototype.resend = function (userId) {
        return $http.put('/lunch/' + this.id + '/user/' + userId + '/email');
    };

    l.prototype.inviteGuest = function (guest) {
        return $http.post('/lunch/' + this.id + '/email', guest);
    };

    return l;
});
