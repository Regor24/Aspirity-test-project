var gulp = require('gulp');
var react = require('gulp-react');
var gulpSequence = require('gulp-sequence');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

gulp.task('react', function () {
  return gulp.src('app/jsx/*.jsx')
    .pipe(react())
    .pipe(gulp.dest('app/js'));
});

gulp.task('concat', function() {
  return gulp.src(['app/js/utils.js', 'app/js/todoModel.js', 'app/js/todoItem.js', 'app/js/todoApp.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('app/js'));    
});

// Transportation sub-tasks for build
gulp.task('style', function() {
  return gulp.src('app/css/*.css')
    .pipe(gulp.dest('dist/css'));    
});
gulp.task('makrup', function() {
  return gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));    
});
gulp.task('scripts', function() {
  return gulp.src('app/js/app.js')
    .pipe(gulp.dest('dist/js'));    
});
// --

gulp.task('build', 
  gulpSequence(['style', 'makrup', 'scripts'])
);

gulp.task('default',
  gulpSequence('watch')
);

gulp.task('watch', function() {
  gulp.watch('app/jsx/*.jsx', ['react', 'concat']); 
  gulp.watch('app/js/*.js', ['concat']);   
});