(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    const user = await app.requireAuth("consumer");
    if (!user) return;

    await app.syncAuthLinks();

    document.getElementById("profileFirstName").value = user.firstName;
    document.getElementById("profileLastName").value = user.lastName;
    document.getElementById("profileEmail").value = user.email;

    document.getElementById("profileForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const target = await app.getUserById(user.id);
      if (!target) return;

      target.firstName = document.getElementById("profileFirstName").value.trim();
      target.lastName = document.getElementById("profileLastName").value.trim();

      const newPassword = document.getElementById("profilePassword").value;
      if (newPassword) {
        target.password = newPassword;
      }

      const updatedUser = await app.updateUser(user.id, {
        firstName: target.firstName,
        lastName: target.lastName,
        password: target.password,
      });
      app.setCurrentUser(updatedUser || target);
      app.showNotice(document.getElementById("profileNotice"), "Profile updated successfully.", "success");
    });
  });
})();
