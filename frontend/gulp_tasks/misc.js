const path = require('path');
const gulp = require('gulp');
const del = require('del');
const filter = require('gulp-filter');
const conf = require('../conf/gulp.conf');

gulp.task('clean', function () {
    return del([conf.paths.dist, conf.paths.tmp]);
});

gulp.task('other', function () {
    const fileFilter = filter(file => file.stat.isFile());

    return gulp.src([
        path.join(conf.paths.src, '/**/*'),
        path.join(`!${conf.paths.src}`, '/**/*.{html,css,js,scss}')
    ])
    .pipe(fileFilter)
    .pipe(gulp.dest(conf.paths.dist));
});
