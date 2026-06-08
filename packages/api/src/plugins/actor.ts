/**
 * Compatibility shim — actor plugin moved to plugins/auth.ts.
 *
 * Kept so any stragglers importing `./plugins/actor.js` still resolve.
 * New code should import from `./plugins/auth.js`.
 */

export { authPlugin as actorPlugin } from "./auth.js";
