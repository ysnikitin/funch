const gulp = require('gulp');
const browserSync = require('browser-sync');
const wiredep = require('wiredep').stream;
const angularFilesort = require('gulp-angular-filesort');
const gulpInject = require('gulp-inject');
const conf = require('../conf/gulp.conf');

gulp.task('inject', function () {
    const injectScripts = gulp.src([
        conf.path.tmp('index.js'),
        conf.path.tmp('routes.js'),
        conf.path.tmp('templateCacheHtml.js'),
        conf.path.tmp('components/**/*.js'),
        conf.path.tmp('routes/**/*.js'),
        conf.path.tmp('directives/**/*.js'),
        conf.path.tmp('services/**/*.js'),
        conf.path.tmp('factories/**/*.js'),
        conf.path.tmp('resources/**/*.js')
    ]);

    const injectOptions = {
        ignorePath: [conf.paths.src, conf.paths.tmp],
        addRootSlash: false
    };

    return gulp.src(conf.path.src('index.html'))
        .pipe(gulpInject(injectScripts, injectOptions))
        .pipe(wiredep(Object.assign({}, conf.wiredep)))
        .pipe(gulp.dest(conf.paths.tmp))
        .pipe(browserSync.stream());
});
