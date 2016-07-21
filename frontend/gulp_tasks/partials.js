const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const angularTemplatecache = require('gulp-angular-templatecache');
const print = require('gulp-print');
const replace = require('gulp-replace');
const conf = require('../conf/gulp.conf');

gulp.task('partials', function () {
    return gulp.src(conf.path.src('**/*.html'))
        .pipe(htmlmin())
        .pipe(angularTemplatecache('templateCacheHtml.js', {
          module: conf.ngModule,
          root: 'src'
        }))
        .pipe(gulp.dest(conf.path.tmp()));
});
