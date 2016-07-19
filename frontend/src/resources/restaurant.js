angular.module('funch').factory('Restaurant', function ($resource, $http) {
    var r = $resource('/restaurants/:id', {
        id: '@id'
    }, {
        favorites: {
            method: 'GET'
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

    r.prototype.$saveOrUpdate = function() {
        if (this.id) {
            return this.$update();
        } else {
            return this.$save();
        }
    };

    r.prototype.quickpicks = function () {
        return $http.get('/restaurants/' + this.id + '/quickpicks').then(function (data) {
            return data.data;
        });
    };

    r.prototype.votes = function () {
        return $http.get('/restaurants/' + this.id + '/votes').then(function (data) {
            return data.data;
        });
    };

    r.prototype.userVotes = function (userId) {
        return $http.get('/restaurants/' + this.id + '/user/' + userId + '/votes').then(function (data) {
            return data.data;
        });
    };

    r.prototype.upvote = function (userId) {
        return $http.put('/restaurants/' + this.id + '/user/' + userId + '/upvote').then(function (data) {
            return data.data;
        });
    };

    r.prototype.downvote = function (userId) {
        return $http.put('/restaurants/' + this.id + '/user/' + userId + '/downvote').then(function (data) {
            return data.data;
        });
    };

    return r;
});
