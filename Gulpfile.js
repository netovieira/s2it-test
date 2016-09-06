// Aqui nós carregamos o gulp e os plugins através da função `require` do nodejs
var gulp   = require('gulp'),
    inject = require('gulp-inject'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    sass   = require('gulp-ruby-sass'),
    notify = require("gulp-notify"),
    bower  = require('gulp-bower'),
    htmlmin = require('gulp-html-minifier'),
    removeHtmlComments = require('gulp-remove-html-comments'),
    webserver = require('gulp-webserver');


// Definimos o diretorio dos arquivos para evitar repetição futuramente
var config = {
    sassPath: './resources/sass',
    bowerDir: './bower_components',
    jsPath: './resources/js',
    indexPath: './',
    pagesPath: './pages',
    publicPath: './public'
};

//Gera um arquivo contendo todos os icones
gulp.task('icons', function() {
    return gulp.src([
        config.bowerDir + '/font-awesome/fonts/**.*',
        config.bowerDir + '/materialize/fonts/roboto/**.*'
    ])
    .pipe(gulp.dest(config.publicPath+'/fonts'));
});
//Copia as fontes
gulp.task('fonts', function() {
    return gulp.src([
        config.bowerDir + '/materialize/fonts/**/**.*'
    ])
        .pipe(gulp.dest(config.publicPath+'/fonts'));
});

//Aqui criamos uma nova tarefa através do ´gulp.task´ e damos a ela o nome 'lint'
gulp.task('lint', function() {

// Aqui carregamos os arquivos que a gente quer rodar as tarefas com o `gulp.src`
// E logo depois usamos o `pipe` para rodar a tarefa `jshint`
    gulp.src(config.jsPath+'/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//Transforma o SASS em CSS
gulp.task('css', function() {
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

//Adiciono os scripts e css no index.html
gulp.task('inject_all', function() {

    var resources = gulp.src([
        config.publicPath+'/**/**/**'
    ], {read: false});

    return gulp.src(config.publicPath+'/index.html')
        .pipe(inject(resources, {
            ignorePath: '/public'
        }))
        .pipe(gulp.dest(config.publicPath));
});

//Criamos outra tarefa com o nome 'dist'
gulp.task('dist', function() {

// Carregamos os arquivos novamente
// E rodamos uma tarefa para concatenação
// Renomeamos o arquivo que sera minificado e logo depois o minificamos com o `uglify`
// E pra terminar usamos o `gulp.dest` para colocar os arquivos concatenados e minificados na pasta build/
    gulp.src(config.jsPath+'/*.js')
        .pipe(concat(config.publicPath))
        .pipe(rename('dist.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.publicPath+'/js/custom'));
});

//Envia index para a pasta public
gulp.task('copy_index', function(){
    return gulp.src([
        config.indexPath + '/index.html'
    ])
        .pipe(gulp.dest(config.publicPath));
});

//Envia as páginas para a pasta public/pages
gulp.task('copy_pages', function(){
    return gulp.src([
        config.pagesPath + '/*.html'
    ])
    .pipe(gulp.dest(config.publicPath+'/pages'));
});

//Envia as images/videos/vetores para a pasta public
gulp.task('copy_assets', function(){
    return gulp.src([
        config.indexPath + '/assets/**/**'
    ])
    .pipe(gulp.dest(config.publicPath+'/assets'));
});

//Envia as páginas para a pasta public/pages
gulp.task('copy_js', function(){
    return gulp.src([
        config.bowerDir+'/jquery/dist/jquery.min.js',
        config.bowerDir+'/materialize/dist/js/materialize.min.js'
    ])
        .pipe(gulp.dest(config.publicPath+'/js'));
});

//Criamos uma tarefa 'default' que vai rodar quando rodamos `gulp` no projeto
gulp.task('default', function() {

// Usamos o `gulp.run` para rodar as tarefas
// E usamos o `gulp.watch` para o Gulp esperar mudanças nos arquivos para rodar novamente
    var tasks = ['lint', 'dist', 'icons', 'fonts', 'css', 'copy_js', 'copy_index', 'copy_pages', 'copy_assets', 'inject_all'];
    gulp.run(tasks);
    var watchFiles = [
        config.indexPath+'/index.html',
        config.indexPath+'/assets/**/*',
        config.indexPath+'/resources/**/*',
        config.indexPath+'/pages/*'
    ]
    gulp.watch(watchFiles, function (evt) {
        gulp.run(tasks);
    })
});

//Minifica os arquivos HTML
gulp.task('minify_html', ['inject_all'], function(){
    return gulp.src([
        config.publicPath + '/**/*.html'
    ])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(removeHtmlComments())
    .pipe(gulp.dest(config.publicPath));
});

//Roda um servidor com o site
gulp.task('webserver', ['default'], function() {
    gulp.src(config.publicPath)
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});