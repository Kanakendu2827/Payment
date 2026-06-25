import React from 'react'

function FormToSheet() {
  const handleSubmit = (e) => {
    e.preventDefault()

    const scriptUrl = (import.meta.env.DEV
      ? '/api/google-script'
      : (import.meta.env.VITE_GOOGLE_SCRIPT_URL || '/api/google-script')
    ).trim()

    if (!scriptUrl) {
      alert('Set VITE_GOOGLE_SCRIPT_URL in your .env file first.')
      return
    }

    fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: e.target.name.value,
        Email: e.target.email.value,
      }),
    })
      .then(async (res) => {
        const text = await res.text()
        if (!res.ok) throw new Error(text || 'Submission failed')
        alert(text || 'Added successfully')
      })
      .catch((error) => {
        console.error(error)
        alert('Could not send data to Google Apps Script.')
      })
  }

  return (
    <div>
      <h1>React to Sheet</h1>
      <form onSubmit={handleSubmit}>
        <input name='name' placeholder='Name 1' /> <br />
        <input name='email' placeholder='Email 1' /> <br />
        <button>Add</button>
      </form>
    </div>
  )
}

export default FormToSheet


