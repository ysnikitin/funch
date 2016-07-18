angular.module('funch').filter('commalist', function () {
    return function (input, key) {
        var a = input || [];

        if (key) {
            a = a.map(function (b) {
                return b[key];
            });
        }

        return a.join(', ');
    };
});
