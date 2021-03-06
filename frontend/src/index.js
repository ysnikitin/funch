var app = angular.module('funch', [
    'ui.router',
    'rzModule',
    'ui.timepicker',
    'ui.bootstrap',
    'toastr',
    'angularSpinner',
    'angular-input-stars',
    'ngResource',
    'ng.deviceDetector',
    'angular-md5',
    'ngTagsInput'
]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            request: function (config) {
                if (config.url.charAt(0) === '/') {
                    config.url = 'http://funchbun.ch:3000/api' + config.url;
                }
                return config || $q.when(config);
            }
        }
    });
});

app.run(function ($rootScope, $window, BrowserDetectSvc) {
    $rootScope.spinner = {
        lines: 13,
        length: 28,
        width: 5,
        radius: 42,
        scale: 1,
        corners: 1,
        color: '#fff',
        opacity: 0.25,
        rotate: 0,
        direction: 1,
        speed: 1,
        trail: 60,
        fps: 20,
        zIndex: 2e9,
        className: 'spinner',
        top: '50%',
        left: '50%',
        shadow: false,
        hwaccel: false,
        position: 'absolute'
    };

    $rootScope.isMobile = BrowserDetectSvc.isMobile();

    angular.element($window).on('resize', function () {
        $rootScope.isMobile = BrowserDetectSvc.isMobile();
        $rootScope.$apply();
    });
});
