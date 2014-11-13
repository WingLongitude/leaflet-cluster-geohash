'use strict';
// generated on 2014-10-06 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');

gulp.task('scss', function () {
	return gulp.src('app/styles/main.scss')
		.pipe($.rubySass({
			style: 'expanded',
			precision: 10
		}))
		.pipe($.autoprefixer('last 1 version'))
		.pipe(gulp.dest('.tmp/styles'))
		.pipe($.size());
});

gulp.task('stylus', function () {
	return gulp.src('app/styles/style.styl')
		.pipe($.stylus())
		.pipe($.autoprefixer('last 1 version'))
		.pipe(gulp.dest('.tmp/styles'))
		.pipe($.size());
});

gulp.task('scripts', function () {
	return gulp.src('app/scripts/**/*.js')
});

gulp.task('jades', function() {
	return gulp.src('app/**/*.jade')
		.pipe($.jade({pretty: true}))
		.pipe(gulp.dest('app'))
		.pipe($.size());
});

gulp.task('html', ['scss', 'stylus', 'scripts'], function () {
	var jsFilter = $.filter('**/*.js');
	var cssFilter = $.filter('**/*.css');
	var assets = $.useref.assets({searchPath: '{.tmp,app}'});

	return gulp.src('app/*.jade')
		.pipe($.jade({pretty: true}))
		.pipe(assets)
		.pipe(jsFilter)
		.pipe($.uglify())
		.pipe(jsFilter.restore())
		.pipe(cssFilter)
		.pipe($.csso())
		.pipe(cssFilter.restore())
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe(gulp.dest('dist'))
		.pipe($.size());
});

gulp.task('images', function () {
	return gulp.src('app/images/**/*')
		.pipe($.cache($.imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		})))
		.pipe(gulp.dest('dist/images'))
		.pipe($.size());
});

gulp.task('fonts', function () {
	return gulp.src(mainBowerFiles())
		.pipe($.filter('**/*.{eot,svg,ttf,woff}'))
		.pipe($.flatten())
		.pipe(gulp.dest('dist/fonts'))
		.pipe($.size());
});

gulp.task('extras', function () {
	return gulp.src(['app/*.*', '!app/*.html', '!app/*.jade'], { dot: true })
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
	return gulp.src(['.tmp', 'dist', 'plato', 'app/*.html'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
	gulp.start('build');
});

gulp.task('connect', function () {
	var connect = require('connect');
	var serveStatic = require('serve-static');
	var serveIndex = require('serve-index')
	var app = connect()
		.use(require('connect-livereload')({ port: 35729 }))
		.use(serveStatic('app', {'index': ['index.html', 'index.htm']}))
		.use(serveStatic('.tmp', {'index': false}))
		.use(serveIndex('app'));

	require('http').createServer(app)
		.listen(9000)
		.on('listening', function () {
			console.log('Started connect web server on http://localhost:9000');
		});
});

gulp.task('serve', ['connect', 'scss', 'stylus', 'jades'], function () {
	//require('open')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
	var wiredep = require('wiredep').stream;

	gulp.src('app/styles/*.scss')
		.pipe(wiredep({
			directory: 'app/bower_components'
		}))
		.pipe(gulp.dest('app/styles'));

	gulp.src('app/*.html')
		.pipe(wiredep({
			directory: 'app/bower_components',
			exclude: ['bootstrap-sass-official']
		}))
		.pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
	var server = $.livereload();
	server.changed();

	// watch for changes
	gulp.watch([
		'app/*.html',
		'.tmp/styles/**/*.css',
		'app/scripts/**/*.js',
		'app/images/**/*'
	]).on('change', function (file) {
		server.changed(file.path);
	});

	gulp.watch('app/*.jade', ['jades']);
	gulp.watch('app/styles/**/*.scss', ['scss']);
	gulp.watch('app/styles/**/*.styl', ['stylus']);
	gulp.watch('app/scripts/**/*.js', ['scripts']);
	gulp.watch('app/images/**/*', ['images']);
	gulp.watch('bower.json', ['wiredep']);
});