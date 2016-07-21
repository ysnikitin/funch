const path = require('path');
const gulp = require('gulp');
const del = require('del');
const filter = require('gulp-filter');
const flatten = require('gulp-flatten');
const print = require('gulp-print');
const mainBowerFiles = require('gulp-main-bower-files');
const conf = require('../conf/gulp.conf');

gulp.task('fonts', function() {
    var fonts = filter('**/*.{ttf,svg,woff,woff2,eot}')

    return gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        .pipe(fonts)
        .pipe(flatten())
        .pipe(gulp.dest(conf.paths.dist + '/fonts'));
});
