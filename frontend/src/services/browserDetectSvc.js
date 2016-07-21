angular.module('funch').service('BrowserDetectSvc', function (deviceDetector) {
    this.isMobile = function () {
        var devices = deviceDetector.raw.device;
        for (var k in devices) {
            if (devices[k]) {
                return true;
            }
        }

        if (window.innerWidth < 500) {
            return true;
        }

        return false;
    };
});
