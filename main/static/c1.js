// --- CSRF helper (Django requirement) ---
function getCSRF() {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith("csrftoken="))
    ?.split("=")[1]
}

// --- C1 initialization ---
let threadId = null

const c1 = new C1({
  target: "#c1-root",
  mode: "copilot"
})

c1.onUserInput(async (input) => {
  const res = await fetch("/assistant/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRF()
    },
    body: JSON.stringify({
      text: input.text,
      image: input.imageBase64,
      thread_id: threadId
    })
  })

  const data = await res.json()
  threadId = data.thread_id
  c1.render(data.ui)
})
