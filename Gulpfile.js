// Aqui nós carregamos o gulp e os plugins através da função `require` do nodejs
var gulp   = require('gulp'),
    inject = require('gulp-inject'),
    ss     = require('stream-series'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    sass   = require('gulp-ruby-sass'),
    notify = require("gulp-notify"),
    webserver = require('gulp-webserver');


// Definimos o diretorio dos arquivos para evitar repetição futuramente
var config = {
    sassPath: './resources/sass',
    bowerDir: './bower_components',
    jsPath: './resources/js',
    appPath: './resources/app',
    indexPath: './',
    publicPath: './public'
};

//Copio todas as fontes
gulp.task('fonts', function() {
    return gulp.src([
        config.bowerDir + '/materialize/fonts/**/**.*'
    ])
        .pipe(gulp.dest(config.publicPath+'/fonts'));
});

//Verifico dicas e erros no meu código Javascript
gulp.task('lint', function() {

    gulp.src(config.jsPath+'/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//Transforma o SASS em CSS
gulp.task('sass2css', function() {
    sass(config.sassPath + '/style.scss', {
        loadPath: [
            './resources/sass'
        ]
    })
        .on("error", notify.onError(function (error) {
            return "Error: " + error.message;
        }))
    .pipe(gulp.dest(config.publicPath+'/css'));
});

gulp.task('dist', ['lint'], function() {
    gulp.src(config.jsPath+'/*.js')
        .pipe(concat(config.publicPath))
        .pipe(rename('dist.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.publicPath+'/js/custom'));
});

//Envia index para a pasta public
gulp.task('copy_index', function(){
    return gulp.src([ config.indexPath + '/index.html' ])
               .pipe(gulp.dest(config.publicPath));
});
//Copia o App Angular para a pasta public
gulp.task('copy_angular', function(){
    return gulp.src([ config.appPath + '/*.js' ])
               .pipe(gulp.dest(config.publicPath+'/app'));
});
//Copia os arquivos json para a pasta public
gulp.task('copy_templates', function(){
    return gulp.src([ config.appPath + '/templates/*' ])
               .pipe(gulp.dest(config.publicPath+'/app/templates'));
});

//Adiciono os scripts e css no index.html
gulp.task('inject_all', ['sass2css', 'dist', 'copy_index', 'copy_css', 'copy_js', 'copy_angular', 'copy_templates'], function() {

    var CssFiles = gulp.src([
        config.publicPath+'/css/**/**'
    ], {read: false});
    var Components = gulp.src([
        config.publicPath+'/js/components/**'
    ], {read: false});
    var CustomJS = gulp.src([
        config.publicPath+'/js/custom/**'
    ], {read: false});
    var AngularApp = gulp.src([
        config.publicPath+'/app/**'
    ], {read: false});

    return gulp.src(config.publicPath+'/index.html')
        .pipe(inject(ss(CssFiles, Components, AngularApp, CustomJS), {
            ignorePath: '/public'
        }))
        .pipe(gulp.dest(config.publicPath));
});

//Envia as páginas para a pasta public/pages
gulp.task('copy_js', function(){
    return gulp.src([
        config.bowerDir+'/jquery/dist/jquery.min.js',
        config.bowerDir+'/materialize/dist/js/materialize.min.js',
        config.bowerDir+'/angular/angular.min.js',
        config.bowerDir+'/angular/ngStorage.min.js'
    ])
        .pipe(gulp.dest(config.publicPath+'/js/components'));
});
//Envia o css dos componentes para a pasta public/pages
gulp.task('copy_css', function(){
    return gulp.src([
        config.bowerDir+'/materialize/dist/css/*.min.css'
    ])
    .pipe(gulp.dest(config.publicPath+'/css'));
});

//Criamos uma tarefa 'default' que vai rodar quando rodamos `gulp` no projeto
gulp.task('default', function() {

// Usamos o `gulp.run` para rodar as tarefas
// E usamos o `gulp.watch` para o Gulp esperar mudanças nos arquivos para rodar novamente
    var tasks = ['inject_all'];
    gulp.run(tasks);
    var watchFiles = [
        config.indexPath+'/index.html',
        config.indexPath+'/resources/**/*',
    ];
    gulp.watch(watchFiles, function (evt) {
        gulp.run(tasks);
    })
});

//Roda um servidor com o site
gulp.task('webserver', ['inject_all', 'default'], function() {
    gulp.src(config.publicPath)
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});