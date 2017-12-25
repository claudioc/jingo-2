(() => {
  const qs = document.querySelector.bind(document)
  const doPreview = qs('.do-preview')
  const doEdit = qs('.do-edit')
  const previewSection = qs('.preview')
  const editorSection = qs('.editor')
  const form = editorSection.querySelector('form')

  doPreview.addEventListener('click', async () => {
    window.editorInstance.save()
    editorSection.classList.add('hidden')
    previewSection.classList.remove('hidden')
    doEdit.classList.remove('hidden')
    doPreview.classList.add('hidden')

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const response = await fetch(`/api/render`, {
      method: 'POST',
      body: JSON.stringify({
        content: form.querySelector('textarea').value
      }),
      headers
    })

    if (response.ok) {
      previewSection.querySelector('.content').innerHTML = await response.text()

    }
  })
  doEdit.addEventListener('click', () => {
    editorSection.classList.remove('hidden')
    previewSection.classList.add('hidden')
    doEdit.classList.add('hidden')
    doPreview.classList.remove('hidden')
  })

})()
