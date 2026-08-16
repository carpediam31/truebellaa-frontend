# Frontend ↔ Backend integration (what changed)

Your React storefront now talks to the FastAPI backend instead of the
hard-coded product list. The **design and UI are unchanged** — only the
data layer was rewired. Verified end-to-end in a real browser: catalogue
loads from the API, the language switcher shows Hindi, and a full
add-to-bag → checkout → payment → order-confirmation runs through the
backend.

## What was added / changed

| File | Change |
|---|---|
| `src/api.js` **(new)** | One place that talks to the backend (products, checkout, payment, newsletter). Reads base URL + tenant from `.env`. |
| `src/data.js` | The old hard-coded `PRODUCTS` array is gone (data now comes from the API). Kept `METALS` and `fmt`. |
| `src/context/AppContext.jsx` | Loads products from the API, adds a **language switch**, stores the variant **SKU** in the cart, and `payNow` now calls the real **checkout → Razorpay → verify** flow. |
| `src/components/ProductDetail.jsx` | Fetches the product (with variants) from the API by slug; add-to-bag resolves the exact SKU. |
| `src/components/Home.jsx`, `Listing.jsx`, `ProductCard.jsx` | Read products from context instead of the static file. |
| `src/components/Header.jsx` | Small **language dropdown** (EN / हिं / த / বাং / मरा). |
| `.env.example` **(new)** | Set `VITE_API_BASE` and `VITE_TENANT_SLUG`. |

## Run it (both together)

```bash
# 1) Backend  (from backend/truebellaa-backend)
uvicorn app.main:app --reload           # http://localhost:8000

# 2) Frontend (from this project)
cp .env.example .env                     # defaults point at localhost:8000
npm install
npm run dev                              # http://localhost:5173
```

Open the storefront, switch languages in the header, add a piece to the
bag and check out. With no Razorpay keys set, checkout runs in **demo
mode** (auto-success) — exactly like before, but the order is now really
saved in the database and appears in the Admin panel's orders + activity
log. Add real Razorpay keys to the backend `.env` to take live payments;
no frontend change needed.

## Notes

* The backend must be running, and its `CORS_ORIGINS` must include your
  storefront origin (defaults already include `http://localhost:5173`).
* Product images still come from `public/images/products/…` (unchanged).
* Newsletter signups now actually save (to `newsletter_subscribers`).
