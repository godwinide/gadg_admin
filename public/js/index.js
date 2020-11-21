const forms = document.querySelectorAll("form");

forms.forEach(form => {
    form.addEventListener("submit", () => {
        const btn = form.querySelector("button")
        btn.setAttribute(disables,"true");
        btn.innerText = "Please Wait";
    })
})