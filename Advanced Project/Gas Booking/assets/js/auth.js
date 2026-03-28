(function () {
  const app = window.GasApp;
  if (!app) return;
  const pageRole = document.body?.dataset.authRole || "consumer";
  const redirectTarget = document.body?.dataset.redirectTarget || "";
  const roleLabel = pageRole === "admin" ? "admin" : "consumer";

  async function register() {
    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName = document.getElementById("registerLastName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    const notice = document.getElementById("authNotice");

    if (!firstName || !lastName || !email || !password) {
      app.showNotice(notice, "Please fill in all required registration fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      app.showNotice(notice, "Passwords do not match.", "error");
      return;
    }

    const existingUser = await app.getUserByEmail(email);
    if (existingUser) {
      app.showNotice(notice, "An account with this email already exists.", "error");
      return;
    }

    const newUser = {
      id: app.createId("USR"),
      firstName,
      lastName,
      email,
      password,
      role: pageRole,
      createdAt: new Date().toISOString(),
    };

    await app.createUser(newUser);
    app.setCurrentUser(newUser);
    app.showNotice(notice, `Registration successful. Redirecting to the ${roleLabel} dashboard...`, "success");

    window.setTimeout(() => {
      app.navigate(redirectTarget || app.getDashboardPathForUser(newUser), newUser.id);
    }, 700);
  }

  async function login() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const notice = document.getElementById("authNotice");
    const user = await app.getUserByEmail(email);

    if (!user || user.password !== password) {
      app.showNotice(notice, "Invalid email or password.", "error");
      return;
    }

    if (user.role !== pageRole) {
      app.showNotice(notice, `This account is not allowed on the ${roleLabel} login page.`, "error");
      return;
    }

    app.setCurrentUser(user);
    app.showNotice(notice, `Login successful. Redirecting to the ${roleLabel} dashboard...`, "success");

    window.setTimeout(() => {
      app.navigate(redirectTarget || app.getDashboardPathForUser(user), user.id);
    }, 500);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await app.ensureInitialized();
    await app.syncAuthLinks();

    const currentUser = await app.getCurrentUser();
    if (currentUser && currentUser.role === pageRole) {
      app.navigate(redirectTarget || app.getDashboardPathForUser(currentUser), currentUser.id);
      return;
    }

    document.getElementById("registerForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      register();
    });

    document.getElementById("loginForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      login();
    });
  });
})();
