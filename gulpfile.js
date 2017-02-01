// BASE
var gulp        = require('gulp');
var watch       = require('gulp-watch');
// SYNC
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
// COMPRESSOR
var uglify      = require('gulp-uglify');
var cleanCSS    = require('gulp-clean-css');
var imagemin    = require('gulp-imagemin');
// SASS
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
// TOOLS
var rename      = require("gulp-rename");
var gulpif      = require('gulp-if');
var useref      = require('gulp-useref');
var run         = require('gulp-run');
var del         = require('del');
var fs          = require('fs');
// PATH
var appPath      = './app/';
var prodPath      = './prod/';
var sassPath     = appPath + 'sass/';
var bootstrapStylePath  = appPath + 'bower_components/bootstrap-sass/assets/stylesheets/';
var bootstrapFontPath   = appPath + 'bower_components/bootstrap-sass/assets/fonts/bootstrap/';
var fontawesomePath     = appPath + 'bower_components/font-awesome/';
// VARIABLES
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};
var autoprefixerOptions = {
  browsers: [
  "Android 2.3",
  "Android >= 4",
  "Chrome >= 20",
  "Firefox >= 24",
  "Explorer >= 8",
  "iOS >= 6",
  "Opera >= 12",
  "Safari >= 6"
  ]
};
// LOCALHOST FOLDER NAME
//var localhostPath = '/folder-name-in-htdocs/app/index.php'
var localhostPath = '/Gulp-Php-Sass-Bootstrap-Font-Awesome/app/index.php'


//-----------------------------------------------------------------------
// GULP INIT     
//-----------------------------------------------------------------------

gulp.task('bootstrap-saas', function(){

    fs.stat(sassPath+'bootstrap/', function(err, stat) {
        if(err != null) {
            return gulp
                .src([
                  '!'+bootstrapStylePath+'_bootstrap-compass.scss',
                  '!'+bootstrapStylePath+'_bootstrap-mincer.scss',
                  '!'+bootstrapStylePath+'_bootstrap-sprockets.scss',
                  bootstrapStylePath+'**'
                ])
                .pipe(gulp.dest(appPath+'sass/bootstrap/'))
            ;
        }
    });
    
});

gulp.task('bootstrap-variables', function(){
    
    fs.stat(sassPath+'custom/', function(err, stat) {
        if(err != null) {
            return gulp
                .src(bootstrapStylePath+'bootstrap/_variables.scss')
                .pipe(rename({
                    basename: "_bootstrap-variables"
                }))
                .pipe(gulp.dest(appPath+'sass/'))
            ;
        }
    });
    
});

gulp.task('bootstrap-icons', function(){
    
    fs.stat(appPath+'/fonts/bootstrap/', function(err, stat) {
        if(err != null) {
            return gulp
                .src(bootstrapFontPath+'*')
                .pipe(gulp.dest(appPath+'fonts/bootstrap/'))
            ;
        }
    });
    
});


gulp.task('init', ['bootstrap-saas','bootstrap-variables', 'bootstrap-icons']);


//-----------------------------------------------------------------------
// GULP ICOMOON    
//-----------------------------------------------------------------------


// ICOMOON (ne pas toucher app/sass/icomoon/icomoon.scss)
// requiert icomoon-build (npm install) puis utiliser gul-run (npm install) pour exécuter le script
// Dans icomoon app : 
//  1 générer font 
//  2 Préférence > Font Name : icomoon , Class Prefix : icon-
//  3 Revenir dans manage project et Download 
//  4 Renommer fichier en icomoon.json 
//  5 Placer icomoon.json a la racine
//  6 Décommenter import icomoon/icomoon dans app.scss
//  7 Ajouter classe icomoon <span class="icomoon icon-check"></span>

gulp.task('icomoon', function () {
    fs.stat(appPath+'/fonts/icomoon/', function(err, stat) {
        if(err != null) {
            run('mkdir app/fonts/icomoon').exec();
        }
    });
    run('node_modules/.bin/icomoon-build -p icomoon.json --scss app/sass/icomoon/_icomoon-import.scss --fonts app/fonts/icomoon/').exec();
})


//-----------------------------------------------------------------------
// SASS CONVERSION     
//-----------------------------------------------------------------------


gulp.task('sass', function(){
    
    return gulp
        .src(sassPath+'app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(appPath+'css'))
    ;
    
});


//-----------------------------------------------------------------------
// GULP SERVE
//-----------------------------------------------------------------------


gulp.task('serve', ['sass'], function () {
    browserSync.init({
     proxy: "localhost:8888",
     startPath: localhostPath
    });
    gulp.watch(appPath+'sass/**/*.scss',['sass']);
    gulp.watch(appPath+'css/**/*.css').on('change', browserSync.reload);
    gulp.watch(appPath+'js/*.js').on('change', browserSync.reload);
    gulp.watch(appPath+'**/*.{html,php}').on('change', browserSync.reload);
    watch(appPath+'img/**/*').on('change', browserSync.reload);
    watch(appPath+'fonts/**/*').on('change', browserSync.reload);
    watch(appPath+'sass/**/*').on('change', browserSync.reload);
    watch(appPath+'**/*').on('change', browserSync.reload);
});


//-----------------------------------------------------------------------
// GULP BUILD
//-----------------------------------------------------------------------


// Delete all images in /prod/img/ for clean
gulp.task('step1-clean', function () {
    del([prodPath]).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});


// Copy files (html or php files, fonts, favicon)
gulp.task('step2-copy', function () {
    return gulp
        .src(appPath+'fonts/**/*')
        .pipe(gulp.dest(prodPath+'fonts/'))
    ;
});


// Minify images
gulp.task('step3-imagemin', function () {
    gulp.src(appPath+'*.ico')
        .pipe(gulp.dest(prodPath))
    ;
    gulp.src(appPath+'img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(prodPath+'img/'))
    ;
});


// Useref to compress all css and js files (presents in build tag)
gulp.task('step4-useref', function () {
    return gulp
        .src([appPath+'**/*.{html,php}', '!'+appPath+'bower_components/**/*'])
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(gulp.dest('prod'))
    ;
});

gulp.task('build', ['step1-clean', 'step2-copy', 'step3-imagemin', 'step4-useref']);