const path = require('path');
const gulp = require('gulp');
const del = require('del');
const filter = require('gulp-filter');
const conf = require('../conf/gulp.conf');

gulp.task('images', function () {
    const fileFilter = filter(file => file.stat.isFile());

    return gulp.src([
        path.join(conf.paths.src, '/**/*.{png,jpg,jpeg,gif}')
    ])
    .pipe(fileFilter)
    .pipe(gulp.dest(conf.paths.tmp));
});
