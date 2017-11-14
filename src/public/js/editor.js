/* global CodeMirror */
(() => {
  const content = document.getElementById('editor-content')
  const form = document.getElementById('editor-form')
  const cm = CodeMirror.fromTextArea(content, {
    lineNumbers: true,
    matchBrackets: true,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Enter': (cm) => {
        // Jingo.toggleFullscreen();
      },
      'Ctrl-S': (cm) => {
        // Jingo.save();
      }
    }
  })

  form.addEventListener('submit', (evt) => {
    cm.save()

   // console.log(console.log(content.))
  }, false)
})()
