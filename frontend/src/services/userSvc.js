angular.module('funch').service('UserSvc', function (User) {
    this.get = function (id) {
        return $http.get('/user/' + id).then(function (d) {
            return new User(d.data);
        });
    };

    this.getAll = function () {
        return $http.get('/user').then(function (d) {
            var u = [];
            d.data.forEach(function (x) {
                u.push(new User(x));
            });
            return u;
        });
    };

    this.create = function (user) {
        return $http.post('/user');
    };
});
