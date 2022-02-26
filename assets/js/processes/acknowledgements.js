import {
    VERSION
} from "../constants/version.js";
import {
    lookupOne
} from "../utils/elements.js";

// Populate the version number.
lookupOne("#version").textContent = VERSION;
