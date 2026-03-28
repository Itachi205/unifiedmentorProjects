(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCZoFvs9HHMrumPVgBkdM1eS2tSqBmx9j4",
    authDomain: "gas-booking-177a6.firebaseapp.com",
    projectId: "gas-booking-177a6",
    storageBucket: "gas-booking-177a6.firebasestorage.app",
    messagingSenderId: "167220943206",
    appId: "1:167220943206:web:ec588253fb4cee66c690a7",
    measurementId: "G-9HJESRQ9FR",
  };

  const DEFAULT_USERS = [
    {
      id: "USR-ADMIN",
      firstName: "Admin",
      lastName: "Team",
      email: "admin@1234.gmail.com",
      password: "Admin1234",
      role: "admin",
      createdAt: "2026-03-25T00:00:00.000Z",
    },
    {
      id: "USR-CUSTOMER",
      firstName: "Demo",
      lastName: "Customer",
      email: "gta@gmail.com",
      password: "1234567890",
      role: "consumer",
      createdAt: "2026-03-24T00:00:00.000Z",
    },
  ];

  const DEFAULT_BOOKINGS = [
    {
      id: "BKG-1001",
      userId: "USR-CUSTOMER",
      name: "Demo Customer",
      unNumber: "UN458712",
      selenderType: "32KG",
      address: "Satellite Road, Ahmedabad",
      postalCode: "380015",
      status: "Pending",
      createdAt: "2026-03-24T10:00:00.000Z",
    },
  ];

  function getRootPrefix() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (path.includes("/admin/") || path.includes("/consumer/") || path.includes("/distributor/")) {
      return "../";
    }
    return "";
  }

  if (!window.firebase) {
    console.error("Firebase SDK is missing. Make sure Firebase scripts load before app.js.");
    return;
  }

  const app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(firebaseConfig);
  const db = window.firebase.firestore();

  try {
    if (window.firebase.analytics) {
      window.firebase.analytics(app);
    }
  } catch (error) {
    console.warn("Firebase analytics is unavailable in this environment.", error);
  }

  let initPromise;
  const USERS_COLLECTION = "users";
  const BOOKINGS_COLLECTION = "bookings";
  const SESSION_STORAGE_KEY = "gas-booking-user";
  const CUSTOMER_DASHBOARD_PATH = "consumer/consumer-dashboard.html";
  const ADMIN_DASHBOARD_PATH = "admin/admin-dashboard.html";
  const DEMO_USER_IDS_BY_EMAIL = {
    "gta@gmail.com": "USR-CUSTOMER",
    "admin@1234.gmail.com": "USR-ADMIN",
  };

  function getSessionUserId() {
    const userIdFromUrl = new URLSearchParams(window.location.search).get("user");
    if (userIdFromUrl) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, userIdFromUrl);
      return userIdFromUrl;
    }

    return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  }

  function withSession(path, userId) {
    const currentUserId = userId || getSessionUserId();
    if (!currentUserId) return path;

    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}user=${encodeURIComponent(currentUserId)}`;
  }

  function isInternalLink(href) {
    return href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !/^https?:/i.test(href);
  }

  function getDashboardPathForUser(user, prefix = "") {
    return user?.role === "admin" ? `${prefix}${ADMIN_DASHBOARD_PATH}` : `${prefix}${CUSTOMER_DASHBOARD_PATH}`;
  }

  function preserveSessionLinks(userId) {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!isInternalLink(href) || link.hasAttribute("data-logout")) return;
      link.setAttribute("href", withSession(href, userId));
    });
  }

  async function seedCollectionIfEmpty(collectionName, rows) {
    const snapshot = await db.collection(collectionName).limit(1).get();
    if (!snapshot.empty) return;

    const batch = db.batch();
    rows.forEach((row) => {
      batch.set(db.collection(collectionName).doc(row.id), row);
    });
    await batch.commit();
  }

  async function ensureDemoUsers() {
    const batch = db.batch();

    DEFAULT_USERS.forEach((user) => {
      batch.set(db.collection(USERS_COLLECTION).doc(user.id), user, { merge: true });
    });

    await batch.commit();
  }

  async function ensureDemoBooking() {
    const demoBooking = DEFAULT_BOOKINGS[0];
    if (!demoBooking) return;

    await db.collection(BOOKINGS_COLLECTION).doc(demoBooking.id).set(demoBooking, { merge: true });
  }

  async function ensureInitialized() {
    if (!initPromise) {
      initPromise = (async () => {
        await seedCollectionIfEmpty(USERS_COLLECTION, DEFAULT_USERS);
        await seedCollectionIfEmpty(BOOKINGS_COLLECTION, DEFAULT_BOOKINGS);
        await ensureDemoUsers();
        await ensureDemoBooking();
      })();
    }

    return initPromise;
  }

  async function getUsers() {
    await ensureInitialized();
    const snapshot = await db.collection(USERS_COLLECTION).orderBy("createdAt", "asc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async function getUserById(userId) {
    if (!userId) return null;
    await ensureInitialized();
    const snapshot = await db.collection(USERS_COLLECTION).doc(userId).get();
    return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  async function getUserByEmail(email) {
    if (!email) return null;
    await ensureInitialized();
    const normalizedEmail = String(email).trim().toLowerCase();
    const demoUserId = DEMO_USER_IDS_BY_EMAIL[normalizedEmail];
    if (demoUserId) {
      const demoUser = await getUserById(demoUserId);
      if (demoUser) return demoUser;
    }

    const snapshot = await db
      .collection(USERS_COLLECTION)
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  async function saveUsers(users) {
    await ensureInitialized();
    const batch = db.batch();

    users.forEach((user) => {
      batch.set(db.collection(USERS_COLLECTION).doc(user.id), user);
    });

    await batch.commit();
    return users.slice();
  }

  async function createUser(user) {
    await ensureInitialized();
    await db.collection(USERS_COLLECTION).doc(user.id).set(user);
    return { ...user };
  }

  async function updateUser(userId, updates) {
    await ensureInitialized();
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const snapshot = await userRef.get();
    if (!snapshot.exists) return null;

    const nextUser = {
      id: snapshot.id,
      ...snapshot.data(),
      ...updates,
    };

    await userRef.set(nextUser);
    return nextUser;
  }

  async function getBookings() {
    await ensureInitialized();
    const snapshot = await db.collection(BOOKINGS_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async function getBookingsByUser(userId) {
    if (!userId) return [];
    await ensureInitialized();
    const snapshot = await db
      .collection(BOOKINGS_COLLECTION)
      .where("userId", "==", userId)
      .get();

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
  }

  async function saveBookings(bookings) {
    await ensureInitialized();
    const batch = db.batch();

    bookings.forEach((booking) => {
      batch.set(db.collection(BOOKINGS_COLLECTION).doc(booking.id), booking);
    });

    await batch.commit();
    return bookings.slice();
  }

  async function createBooking(booking) {
    await ensureInitialized();
    await db.collection(BOOKINGS_COLLECTION).doc(booking.id).set(booking);
    return { ...booking };
  }

  async function updateBooking(bookingId, updates) {
    await ensureInitialized();
    const bookingRef = db.collection(BOOKINGS_COLLECTION).doc(bookingId);
    const snapshot = await bookingRef.get();
    if (!snapshot.exists) return null;

    const nextBooking = {
      id: snapshot.id,
      ...snapshot.data(),
      ...updates,
    };

    await bookingRef.set(nextBooking);
    return nextBooking;
  }

  async function getCurrentUser() {
    const userId = getSessionUserId();
    return getUserById(userId);
  }

  function setCurrentUser(user) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("user", user.id);
    window.history.replaceState({}, "", nextUrl.toString());
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, user.id);
    preserveSessionLinks(user.id);
  }

  function clearSession() {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("user");
    window.history.replaceState({}, "", nextUrl.toString());
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    preserveSessionLinks(null);
  }

  function createId(prefix) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }

  function navigate(path, userId) {
    window.location.href = withSession(path, userId);
  }

  function logout() {
    clearSession();
    window.location.href = `${getRootPrefix()}index.html`;
  }

  async function syncAuthLinks() {
    const user = await getCurrentUser();
    const authLinks = document.querySelectorAll("[data-auth-links]");
    const accountLinks = document.querySelectorAll("[data-account-link]");
    const logoutButtons = document.querySelectorAll("[data-logout]");

    authLinks.forEach((container) => {
      const prefix = container.dataset.rootPrefix || getRootPrefix();
      const consumerDashboard = container.dataset.consumerDashboard || `${prefix}${CUSTOMER_DASHBOARD_PATH}`;
      const adminDashboard = container.dataset.adminDashboard || `${prefix}${ADMIN_DASHBOARD_PATH}`;
      const registerHref = container.dataset.registerHref || `${prefix}registration.html`;
      const loginHref = container.dataset.loginHref || `${prefix}login.html`;

      if (!user) {
        container.innerHTML = `
          <li><a href="${registerHref}">Registration</a></li>
          <li><a href="${loginHref}">Login</a></li>
          <li><a href="${loginHref}">My Account</a></li>
        `;
      } else {
        const dashboardHref = user.role === "admin" ? adminDashboard : consumerDashboard;
        container.innerHTML = `
          <li><a href="${withSession(dashboardHref, user.id)}">${user.firstName} ${user.lastName}</a></li>
          <li><a href="${withSession(dashboardHref, user.id)}">My Account</a></li>
          <li><a href="#" data-logout>Logout</a></li>
        `;
      }
    });

    accountLinks.forEach((link) => {
      if (!user) return;
      const prefix = link.dataset.rootPrefix || getRootPrefix();
      const target = getDashboardPathForUser(user, prefix);
      link.setAttribute("href", withSession(target, user.id));
      link.textContent = "My Account";
    });

    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });
    });

    logoutButtons.forEach((button) => {
      button.hidden = !user;
    });

    preserveSessionLinks(user?.id || null);
    return user;
  }

  async function requireAuth(role) {
    const user = await getCurrentUser();
    if (!user) {
      const loginPath = role === "admin" ? "admin-login.html" : "consumer-login.html";
      window.location.href = `${getRootPrefix()}${loginPath}`;
      return null;
    }

    if (role && user.role !== role) {
      const target = getDashboardPathForUser(user, getRootPrefix());
      navigate(target, user.id);
      return null;
    }

    preserveSessionLinks(user.id);
    return user;
  }

  function showNotice(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `app-notice ${type === "success" ? "is-success" : "is-error"}`;
  }

  window.GasApp = {
    createId,
    createBooking,
    createUser,
    ensureInitialized,
    getBookings,
    getBookingsByUser,
    getCurrentUser,
    getDashboardPathForUser,
    getUserByEmail,
    getUserById,
    getUsers,
    logout,
    navigate,
    preserveSessionLinks,
    requireAuth,
    saveBookings,
    saveUsers,
    setCurrentUser,
    showNotice,
    syncAuthLinks,
    updateBooking,
    updateUser,
    withSession,
  };
})();
