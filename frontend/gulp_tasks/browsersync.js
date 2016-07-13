const gulp = require('gulp');
const browserSync = require('browser-sync');
const spa = require('browser-sync-spa');
const browserSyncConf = require('../conf/browsersync.conf');
const browserSyncDistConf = require('../conf/browsersync-dist.conf');

browserSync.use(spa());

gulp.task('browsersync', function (done) {
    browserSync.init(browserSyncConf());
    done();
});

gulp.task('browsersync:dist', function (done) {
    browserSync.init(browserSyncDistConf());
    done();
});
