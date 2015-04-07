var _ = require('lodash');
var fs = require('fs');
var async = require('async');
var gulp = require('gulp');
var gutil = require('gulp-util');
var colors = require('colors');
var plugins = require('gulp-load-plugins')();
var mergeStream = require('merge-stream');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var superagent = require('superagent');
var shell = require('gulp-shell');

var paths = {
	phoneGap: {
		buildDir: 'build/phonegap',
		imageDir: 'build/phonegap/img',
		zip: 'build/phonegap.zip',
		zipRelative: '../phonegap.zip', // Relative path of the zip from buildDir
	}
};

function run(command, options, next) {
	var child_process = require('child_process');
	gutil.log('Run: ' + command);
	if (!options.encoding)
		options.encoding = 'utf8';
	if (options.passthru) {
		options.method = 'spawn';
		options.stdio = 'inherit';
	}

	if (!options.method || options.method == 'exec') {
		child_process.exec(command, options, function(err, stdout, stderr) {
			if (stdout)
				gutil.log('Child process responded:', stdout);
			if (stderr)
				gutil.log('Child process err:', stderr);
			if (options.ignoreFail)
				return next();
			if (err && err.code)
				return next(err.code);
			return next();
		});
	} else if (options.method == 'spawn') {
		if (typeof command != 'array')
			command = command.split(' ');

		var process = child_process.spawn(command[0], command.slice(1), options);
		process.on('close', function(code) {
			next(code);
		});
		if (options.stdout) {
			process.stdout.setEncoding(options.encoding);
			process.stdout.on('data', options.stdout);
		}
		if (options.stderr) {
			process.stderr.setEncoding(options.encoding);
			process.stderr.on('data', options.stderr);
		}
	}
}

/**
* Cleans the PhoneGap build
*/
gulp.task('clean', [], function(next) {
	gutil.log('Cleaning PhoneGap build...');
	rimraf(paths.phoneGap.buildDir, next);
});

gulp.task('default', ['clean'], function(mainNext){
	console.log("Start processing...");

	async.series([
		function(next) {
			gutil.log('Making directory structure for PhoneGap...');
			mkdirp(paths.phoneGap.buildDir, next);
		},
		function(next) {
			gutil.log('Copying image assets...');
			gulp.src('img/**/*-100.png')
				//not working
				.pipe(shell([
			      "find -name *.png | mogrify - -format svg *.png"
			    ]))
			    //not working
				.pipe(gulp.dest('build/phonegap/img'));
			next();
		}
	], mainNext);
});

/*
find -name '*.png' | mogrify -

find -name '*.png' | xargs mogrify

find -name '*.png' -exec 'mogrify {}'
*/


