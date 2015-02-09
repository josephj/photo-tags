# Constants
CSS_PATH        = './src/*.css'
JS_PATH         = './src/*.js'
SASS_PATH       = './src/*.scss'
OUTPUT_PATH     = './src/'
HTML_PATH       = './test/manual/*.html'
HTTP_PORT       = 8087
LIVERELOAD_PORT = 32718

# Gulp plugins
gulp    = require 'gulp'
connect = require 'gulp-connect'
sass    = require 'gulp-sass'
watch   = require 'gulp-watch'
open    = require 'gulp-open'

# Task - connect
gulp.task 'connect', ->
    connect.server
      root: ['.']
      port: HTTP_PORT
      livereload:
        port: LIVERELOAD_PORT

gulp.task 'open', ->
    gulp.src './test/manual/demo.html'
        .pipe open('', url: 'http://localhost:8087/test/manual/demo.html')

# Task - watch
gulp.task 'watch', ->
  gulp.src SASS_PATH
    .pipe watch(SASS_PATH)
    .pipe sass
       errLogToConsole: true
       sourceComments : 'normal'
    .pipe gulp.dest(OUTPUT_PATH)
  gulp.src [HTML_PATH, CSS_PATH, JS_PATH]
    .pipe watch([HTML_PATH, CSS_PATH, JS_PATH])
    .pipe connect.reload()

gulp.task 'default', ['connect', 'open', 'watch']


