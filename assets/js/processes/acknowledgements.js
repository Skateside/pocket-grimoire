import {
    VERSION,
    STAGE
} from "../constants/version.js";
import {
    lookupOne
} from "../utils/elements.js";

// Populate the version number.
const versionElement = lookupOne("#version");
versionElement.textContent = VERSION;

if (STAGE === "beta") {
    versionElement.textContent += ` ${versionElement.dataset.beta}`;
}
