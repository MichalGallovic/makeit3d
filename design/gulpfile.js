var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    prefix = require('gulp-autoprefixer'),
    jade = require('gulp-jade'),
	connect = require('gulp-connect');

gulp.task('webserver', function(){
	connect.server({
        port: 1234,
        livereload: true
    });
});


//#### FOR USING CSSTYLE - RUBY SASS GEM
gulp.task('sass', function () {
    return sass('sass/app.scss')
    .pipe(prefix(
            "last 5 versions", "> 1%", "ie 8", "ie 7"
        ))
    .pipe(gulp.dest('./css'))
    .pipe(connect.reload());
});

gulp.task('jade', function() {
 
  gulp.src('./jade/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./'))
    .pipe(connect.reload());
});

gulp.task('html', function() {
    gulp.src('./*.html')
        .pipe(connect.reload());
});
gulp.task('css', function() {
    gulp.src('./css/*.css')
        .pipe(connect.reload());
});
gulp.task('js', function() {
    gulp.src('./js/*.js')
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch(['./sass/**/*.scss','./js/*.js','./jade/*.jade'],['sass','js','jade']);
});

gulp.task('default',['webserver','watch']);
