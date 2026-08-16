// Product data now comes from the backend API (see src/api.js and
// AppContext). This file keeps only the small static helpers the UI uses.
//
// The old hard-coded PRODUCTS array has moved into the database
// (Phase 1) and is served by the API (Phase 2). Components read products
// from AppContext instead of importing them here.

export const METALS = { Gold: "#c9a24b", Silver: "#c4c4c4", Steel: "#8a8f96" };

export const fmt = (n) => "₹" + Number(n || 0).toLocaleString('en-IN');
