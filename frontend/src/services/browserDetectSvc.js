angular.module('funch').service('BrowserDetectSvc', function (deviceDetector) {
    this.isMobile = function () {
        var devices = deviceDetector.raw.device;

        var mobile = false;
        for (var k in devices) {
            if (devices[k]) {
                mobile = true;
            }
        }
    };
});
