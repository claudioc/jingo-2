const gulp = require('gulp')
const ts = require('gulp-typescript')
const spawn = require('child_process').spawn

const tsProject = ts.createProject('tsconfig.json', {
  isolatedModules: true,
  typescript: require('typescript')
})

let node
const MY_SERVER = ['jingo', '-c', 'config.json']

const server = () => {
  if (node) {
    node.kill()
  }

  const env = Object.create(process.env);
  env.NODE_ENV = 'development';
  node = spawn('node', MY_SERVER, { stdio: 'inherit', env })
  node.on('close', code => {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...')
    }
  })
}

gulp.task('scripts', () => {
  const tsResult = gulp.src('src/**/*.ts').pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('dist'))
})

gulp.task('templates', () => {
  return gulp.src('src/**/*.hbs').pipe(gulp.dest('dist'))
})

gulp.task('watch', done => {
  const tsWatcher = gulp.watch('src/**/*.ts', gulp.series('scripts', 'serve'))
  const hbsWatcher = gulp.watch('src/routes/**/template.hbs', gulp.series('templates', 'serve'))
  gulp.watch('./config.json', gulp.series('serve')).on('change', () => {
    console.log('Config changed')
  })

  tsWatcher.on('change', log)
  hbsWatcher.on('change', log)

  done()

  function log(path) {
    console.log(`File ${path} was changed`)
  }
})

gulp.task('serve', done => {
  server()
  done()
})

gulp.task('default', gulp.series(gulp.parallel('scripts', 'templates'), 'watch', 'serve'))
