angular.module('funch').service('HashSvc', function ($http) {
    this.decrypt = function (hash) {
        return $http.get('/hash/' + hash).then(function (d) {
            return d.data;
        });
    };
});
