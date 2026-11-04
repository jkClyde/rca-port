// Contact page extras: a working form (opens the visitor's email app with the
// message pre-filled, no backend needed) and a live Baguio clock.

const EMAIL = "aquin.randall@gmail.com";

// ---------- form ----------
const form = document.querySelector("[data-contact-form]");

if (form) {
    const sendBtn = form.querySelector("[data-send]");
    const status = form.querySelector(".form-status");

    const setStatus = (message, isError = false) => {
        status.textContent = message;
        status.classList.toggle("is-error", isError);
    };

    const submit = (event) => {
        event.preventDefault();

        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const email = String(data.get("email") || "").trim();
        const type = String(data.get("type") || "Website");
        const message = String(data.get("message") || "").trim();

        if (!name || !email || !message) {
            setStatus("Please fill in your name, email and project details.", true);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus("That email address doesn't look right.", true);
            return;
        }

        const subject = `Project inquiry: ${type}`;
        const body = `${message}\n\n- ${name}\n${email}`;

        setStatus(`Opening your email app. If nothing opens, write to ${EMAIL}.`);

        window.location.href =
            `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;
    };

    sendBtn.addEventListener("click", submit);
    form.addEventListener("submit", submit);
}

// ---------- live clock (Baguio is UTC+8) ----------
const clock = document.querySelector("[data-clock]");

if (clock) {
    const format = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Manila",
    });

    const tick = () => {
        clock.textContent = `Baguio ${format.format(new Date())} / UTC+8`;
    };

    tick();
    setInterval(tick, 15000);
}