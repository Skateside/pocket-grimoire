// A simple fallback for details[name]. Small enough that it can simply be
// included in main.js.

if (!("name" in document.createElement("details"))) {
    document.addEventListener("toggle", (event) => {
        const details = event.target?.closest("details[name]");
        
        if (!details || !details.open) {
            return; // Not a <details name> or not opening - ignore
        }

        const name = details.getAttribute("name");
        const allDetails = document.querySelectorAll(`details[name="${name}"]`);

        if (allDetails.length < 2) {
            return; // Unique group - nothing else to do.
        }

        allDetails.forEach((closer) => {
            if (closer !== details) {
                closer.open = false;
            }
        });
    }, { capture: true });
}
