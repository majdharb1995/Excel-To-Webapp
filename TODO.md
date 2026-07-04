# SYNAPTO — SaaS License/Activation Implementation TODO

## Frontend
1. Add new file `frontend/src/hooks/useLicense.js`:
   - Manage license state, base64 localStorage persistence, expiry countdown, activation API call.
2. Add new UI modals:
   - `frontend/src/components/ui/LicenseModal.jsx` (block analyze + show plan + price)
   - `frontend/src/components/ui/ActivationModal.jsx` (submit activation code + error UI)
3. Extend `frontend/src/context/AppContext.jsx` (merge license state into AppContext):
   - Initialize from localStorage (base64), validate expiry, expose:
     - `license`, `daysRemaining`, `isLicenseActive`
     - modal open/close state
     - activation handler + loading/error flags
4. Gate analyze in `frontend/src/components/layout/Hero.jsx`:
   - If not activated/expired => open LicenseModal instead of calling `/analyze`.
5. Update `frontend/src/components/layout/Navbar.jsx`:
   - Show lock/shield icon + “X days remaining” / Arabic equivalent.
   - Turn counter red when `< 7 days`.
6. i18n:
   - Update `frontend/src/utils/i18n.js` with all required license keys (EN/AR).
7. CSS:
   - Create `frontend/src/styles/license.css` for modal overlay + fade-in + input/button neon styling.
   - Update `frontend/src/index.css` to import `license.css`.

## Backend
8. Add `POST /api/activate` in `backend/main.py`:
   - Validates activation code against server-side env/config (NO hardcoded code).
   - Sets `expiresAt = now + 30 days`.
   - Returns `{ success, expiresAt, token }` or `{ success:false, error }`.
9. Protect analysis:
   - Add middleware/check in `/analyze` to require a valid activation token.
   - Reject invalid/expired token with JSON error.
10. Run quick sanity checks:
   - Start backend (uvicorn) and ensure activation + analyze flow works.

## Done Criteria
- First analysis works once for new users (free attempt).
- Second attempt without activation shows modal overlay.
- Activation modal accepts `synapto988` and activates for 30 days.
- Navbar shows countdown; turns red under 7 days.
- Expiry reverts to modal behavior.
- Backend rejects analyze unless activation token is present and valid.
