import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const logoutBtn = document.getElementById('logoutBtn');
const userInfoEl = document.getElementById('userInfo');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = './index.html';
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  });
}

// Show user profile info
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userInfo = userDoc.data();
      if (userInfoEl) {
        userInfoEl.innerHTML = `
          <div><strong>${userInfo.role || 'Voyager'}</strong></div>
          <div class="text-xs text-gray-400">${user.email}</div>
        `;
      }
    }
  } catch (e) {
    console.error("Error fetching profile:", e);
  }
});
