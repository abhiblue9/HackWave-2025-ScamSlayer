export function friendlyAuthError(err) {
  const code = err?.code || ''
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'This sign-in method is disabled. Please enable it in Firebase Console (Authentication > Sign-in method) or contact the admin.'
    case 'auth/popup-blocked':
      return 'Popup was blocked by the browser. Please allow popups for this site or use email sign-in.'
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing. Please try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/email-already-in-use':
      return 'This email is already in use.'
    case 'auth/weak-password':
      return 'Password is too weak. Try a longer password.'
    default:
      return err?.message || 'Authentication error. Please try again.'
  }
}
