export function popup(text) {
    return new Promise((resolve) => {
        const message = document.createElement("div")
        message.id = "popup-whole"
        message.className = "popup-whole"
        message.setAttribute("role", "alert")

        const innerbox = document.createElement("div")
        innerbox.className = "popup-box"
        innerbox.innerText = text

        const button = document.createElement("button")
        button.className = "popup-button"
        button.innerText = "OK"

        button.addEventListener("click", () => {
            message.remove()
            resolve()
        })

        innerbox.appendChild(button)
        message.appendChild(innerbox)
        document.body.appendChild(message)
    })
}