/* global CodeMirror */
;(() => {
  const content = document.getElementById('editor-content')
  const form = document.getElementById('editor-form')
  const cm = CodeMirror.fromTextArea(content, {
    lineNumbers: true,
    matchBrackets: true,
    lineWrapping: true,
    extraKeys: {
      'Cmd-Enter': cm => {
        form.submit()
      }
    }
  })

  form.addEventListener(
    'submit',
    evt => {
      cm.save()
    },
    false
  )

  window.editorInstance = cm
})()
