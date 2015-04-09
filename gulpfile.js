var gulp = require('gulp');
var changed = require('gulp-changed');
var jade = require('gulp-jade');
var vulcanize = require('gulp-vulcanize');
var rename = require("gulp-rename");
var argv = require('yargs').argv;
var exec = require('child_process').exec;

gulp.task('default', ['jade', 'vulcanize']);
gulp.task('jade', function() {
	var dest_dir = './build/compiled_elements/';
	return gulp.src([
			'./components/*.jade'
		])
				// .pipe(changed(dest_dir, {extension: '.html'}))
		.pipe(jade({
			locals:  {pathToPublic:'../', pathToViews:'./'},
			pretty:argv.pretty
		}))
		.pipe(gulp.dest(dest_dir))
});
gulp.task('vulcanize', ['jade'], function () {
	var dest_dir = './build/vulcanized_pages/';
	var src = './build/compiled_elements/*-page.html';
	return gulp.src(src)
			.pipe(vulcanize({
				dest: dest_dir,
				strip: !argv.pretty,
				inline:true
			}))
			.pipe(rename(function(path){
				path.dirname = '../../public/' + path.basename.split('-')[0];
				path.basename = 'index';
			}))
			.pipe(gulp.dest(dest_dir))
});
gulp.task('deploy', ['jade', 'vulcanize'], function(callback){
	exec('parse deploy', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		callback(err);
	});
});