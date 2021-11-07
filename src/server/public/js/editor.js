/* global SimpleMDE */
;(() => {
  const content = document.getElementById('editor-content')
  const form = document.getElementById('editor-form')

  const simpleMde = new SimpleMDE({
    element: content,
    autosave: true,
    minHeight: '500px',
    spellChecker: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'code',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide'
    ]
  })

  const option = simpleMde.codemirror.getOption('extraKeys')
  option['Cmd-Enter'] = () => {
    form.submit()
  }

  simpleMde.codemirror.setOption('extraKeys', option)
  window.editorInstance = simpleMde
})()
