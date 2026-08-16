# TrueBellaa — React version

Same design, same UI, same behavior as the original HTML/CSS/JS site —
rebuilt in React (Vite) so it fits a React-based stack.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
```

## What's inside

- `src/index.css` — the exact same stylesheet from the HTML version. Not a
  single value was changed, so the visual design is identical.
- `src/data.js` — the product catalog (was `PRODUCTS` in the old `data.js`).
  Image paths already point to `/images/products/...` — see
  `public/images/products/README.md` for what files to drop in.
- `src/context/AppContext.jsx` — all the app-wide logic that used to live as
  global variables and functions (`cart`, `go()`, `addToCart()`, `payNow()`,
  etc.), now as React state and functions shared through Context.
- `src/hooks/useReveal.js` — the scroll-reveal fade-in and number-counter
  animation, ported from the original `observeReveals()`.
- `src/components/` — one component per section/page: `Header`, `Home`,
  `Listing`, `ProductDetail` (the PDP), `CartPage`, `Checkout`, `Success`,
  `Drawer` (the slide-out mini cart), `Footer`, `ToastStack`, `MobileMenu`.
- `public/images/` — same local-image setup as the HTML version. Nothing
  hotlinked to Unsplash or any other external site.

## Things worth knowing

- **Routing**: this keeps the original approach — one `page` state value
  that swaps which section renders (`home`, `listing`, `pdp`, `cart`,
  `checkout`, `success`) instead of a real URL router. If you'd rather have
  real URLs (`/product/3`, back-button support, shareable links), I can wire
  up `react-router` — just say the word.
- **Newsletter signup**: ported as-is, meaning it still only checks for an
  `@` and shows a toast — it doesn't send the email anywhere. Same caveat
  as before applies if you want it to actually work.
- **Razorpay key**: still a placeholder in `src/context/AppContext.jsx`
  (`RZP_KEY`). Until you add a real key, checkout runs in demo mode and
  simulates a successful payment.
- **Product photos**: `js/data.js` from the old version is now
  `src/data.js`, with the same local-path convention as before.
