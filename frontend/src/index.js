var app = angular.module('funch', [
    'ui.router',
    'rzModule',
    'ui.timepicker',
    'ui.bootstrap',
    'toastr'
]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            request: function (config) {
                if (config.url.charAt(0) === '/') {
                    config.url = 'http://52.4.25.73:3000/api' + config.url;
                }
                return config || $q.when(config);
            }
        }
    });
});
