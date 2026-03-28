// js/authGuard.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/**
 * Ensures the user is logged in and optionally has a specific role.
 * @param {string|null} expectedRole - 'admin', 'manager', 'cook', etc. or null for any logged-in user.
 * @returns {Promise<object>} - Returns the user object and their role.
 */
export function requireAuth(expectedRole = null) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = './index.html';
        reject("Not authenticated");
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      let role = 'user';

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          role,
          createdAt: serverTimestamp()
        }, { merge: true });
      } else {
        role = docSnap.data().role || 'user';
      }

      if (expectedRole && role !== expectedRole) {
        window.location.href = './access_denied.html';
        reject("Insufficient role");
        return;
      }

      resolve({ user, role });
    });
  });
}
