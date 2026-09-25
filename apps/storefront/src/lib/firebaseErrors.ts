/**
 * Maps Firebase Auth error codes and generic errors to friendly user-facing messages.
 */
export function getFirebaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;

    switch (code) {
      // ── Rate limiting ──────────────────────────────────────────────────────
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';

      // ── Credentials ───────────────────────────────────────────────────────
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-email':
        return 'Incorrect email or password.';

      // ── Account state ─────────────────────────────────────────────────────
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';

      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';

      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method. Try Google Sign-In.';

      // ── Password requirements ─────────────────────────────────────────────
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';

      case 'auth/missing-password':
        return 'Please enter a password.';

      // ── Network ───────────────────────────────────────────────────────────
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';

      // ── Popup / OAuth ─────────────────────────────────────────────────────
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';

      case 'auth/cancelled-popup-request':
        // Ignore — this fires when a second popup is opened before the first closes
        return '';

      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Please allow popups for this site.';

      // ── Expired / missing action codes ────────────────────────────────────
      case 'auth/expired-action-code':
      case 'auth/invalid-action-code':
        return 'This link has expired or is invalid. Please request a new one.';

      // ── Firestore / Storage ───────────────────────────────────────────────
      case 'permission-denied':
        return 'You do not have permission to perform this action.';

      case 'unavailable':
        return 'Service temporarily unavailable. Please try again shortly.';

      default:
        // Dev-only: log the unknown code so we can add it later
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[firebaseErrors] Unmapped error code:', code);
        }
        return 'Something went wrong. Please try again.';
    }
  }

  if (err instanceof Error && err.message) {
    // Return the message only if it doesn't look like a raw Firebase code string
    if (!err.message.toLowerCase().includes('firebase')) {
      return err.message;
    }
  }

  return 'Something went wrong. Please try again.';
}
