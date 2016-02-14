var gulp = require('gulp'),
    path = require('path'),
    jshintReporter = require('jshint-stylish'),
    plugins = require('gulp-load-plugins')({
        config: path.join(__dirname, 'package.json'),
        rename: {
            'gulp-angular-embed-templates': 'embedTemplates'
        }
    });

var sctiptPath = {
    src: {
        files: 'src/js/**/*.js'
    }
};

gulp.task('jshint', function (done) {
    gulp
        .src(sctiptPath.src.files)
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter(jshintReporter));
    done();
});

gulp.task('build', function () {
    var pkg = require('./bower.json');

    var header = ['/**',
        ' * <%= pkg.name %>',
        ' * <%= pkg.description %>',
        ' * @version v<%= pkg.version %>',
        ' * @author <%= pkg.author %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        '(function (angular) {',
        '',
        ''].join('\n');

    var footer = [
        '',
        '})(angular);',
        ''].join('\n');

    gulp
        .src([
            'src/js/mdKeyboard.module.js',
            'src/js/mdKeyboard.config.js',
            'src/js/mdKeyboard.config.layouts.js',
            'src/js/mdKeyboard.config.deadkey.js',
            'src/js/mdKeyboard.config.numpad.js',
            'src/js/mdKeyboard.config.symbols.js',
            'src/js/mdKeyboard.provider.js',
            'src/js/mdKeyboard.directive.js'
        ])
        .pipe(plugins.concat('mdKeyboard.js'))
        .pipe(plugins.header(header, {pkg: pkg}))
        .pipe(plugins.footer(footer))
        .pipe(plugins.embedTemplates())
        .pipe(plugins.replace(/[\r\n]+\s*\/\/.*TODO:+.*/gi, ''))
        .pipe(gulp.dest('./dist/'))
        .pipe(plugins.uglify())
        .pipe(plugins.concat('mdKeyboard.min.js'))
        .pipe(gulp.dest('./dist/'));

    gulp
        .src('src/css/*.scss')
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['jshint', 'build'], function () {
    gulp.watch(sctiptPath.src.files, ['jshint', 'build']);
});

gulp.task('changelog', function (done) {
    var pkg = require('./bower.json');
    var changelog = require('conventional-changelog');
    var fs = require('fs');

    var options = {
        repository: pkg.homepage,
        version: pkg.version,
        file: 'CHANGELOG.md'
    };

    var filePath = './' + options.file;
    changelog(options, function (err, log) {
        if (err) {
            throw err;
        }

        fs.writeFile(filePath, log, done);
    });
});
