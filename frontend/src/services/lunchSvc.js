angular.module('funch').service('LunchSvc', function (Lunch) {
    this.get = function (id) {
        return $http.get('/lunch/' + id).then(function (d) {
            return new Lunch(d.data.data);
        });
    };

    this.create = function (lunch) {
        return $http.post('/lunch', lunch);
    };

    this.getFavorites = function () {
        return $http.get('/restaurants/favorites').then(function (d) {
            return new Lunch(d.data.data);
        });
    };

    this.getActive = function () {
        return $http.get('/lunch/active').then(function (d) {
            return new Lunch(d.data.data);
        });
    };
});
