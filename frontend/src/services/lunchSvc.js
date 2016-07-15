angular.module('funch').service('LunchSvc', function ($http, Lunch) {
    this.get = function (id) {
        return $http.get('/lunch/' + id, { cache: false }).then(function (d) {
            return new Lunch(d.data);
        });
    };

    this.create = function (lunch) {
        var self = this;
        return $http.post('/lunch', lunch).then(function (d) {
            return self.get(d.data.id).then(function (c) {
                return c;
            });
        });
    };

    this.getFavorites = function () {
        return $http.get('/restaurants/favorites').then(function (d) {
            return new Lunch(d.data);
        });
    };

    this.getActive = function () {
        return $http.get('/lunch/active').then(function (d) {
            if (d.data.id) {
                return new Lunch(d.data);
            } else {
                return undefined;
            }
        });
    };
});
