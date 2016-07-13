const gulp = require('gulp');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const gulpInject = require('gulp-inject');
const conf = require('../conf/gulp.conf');
const print = require('gulp-print');

gulp.task('styles', function () {
    const injectStyles = gulp.src([
        conf.path.src('**/*.scss'),
        '!' + conf.path.src('**/index.scss')
    ])

    const injectOptions = {
        addRootSlash: false,
        starttag: '// inject',
        endtag: '// endinject',
        transform: function (filepath) {
            return '@import "' + filepath + '";';
        }
    };

    return gulp.src(conf.path.src('index.scss'))
        .pipe(print())
        .pipe(gulpInject(injectStyles, injectOptions))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        })).on('error', conf.errorHandler('Sass'))
        .pipe(postcss([autoprefixer()])).on('error', conf.errorHandler('Autoprefixer'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(conf.path.tmp()))
        .pipe(browserSync.stream());
});
