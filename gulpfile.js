var gulp            = require("gulp");
var ts              = require("gulp-typescript");
var sass            = require('gulp-sass');
var browserSync     = require('browser-sync').create();
var tsProject       = ts.createProject("tsconfig.json");

gulp.task('ts', function(){
    return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist"));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("src/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("dist"))
        .pipe(browserSync.stream());
});

// Static Server + watching scss/html files
gulp.task('serve', function() {
    
        browserSync.init({
            server: "./dist"
        });
        
        gulp.watch("src/*.ts", ['ts']).on('change', browserSync.reload);
        gulp.watch("src/*.scss", ['sass']).on('change', browserSync.reload);
        gulp.watch("dist/*.html").on('change', browserSync.reload);
    });

gulp.task('default', ['sass', 'ts', 'serve']);