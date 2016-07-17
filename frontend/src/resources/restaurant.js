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
            console.log(data);
            return data.data;
        });
    };

    return r;
});
