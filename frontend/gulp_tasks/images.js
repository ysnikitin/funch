const path = require('path');
const gulp = require('gulp');
const del = require('del');
const filter = require('gulp-filter');
const conf = require('../conf/gulp.conf');

gulp.task('images', function () {
    return gulp.src([
        path.join(conf.paths.src, '/**/*.{png,jpg,jpeg,gif}')
    ])
    .pipe(gulp.dest(conf.paths.tmp));
});
