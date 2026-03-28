(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    const admin = await app.requireAuth("admin");
    if (!admin) return;

    const users = (await app.getUsers()).filter((user) => user.role !== "admin");
    const bookings = await app.getBookings();

    document.getElementById("adminUsersCount").textContent = String(users.length);
    document.getElementById("adminBookingsCount").textContent = String(bookings.length);
    document.getElementById("adminPendingCount").textContent = String(bookings.filter((booking) => booking.status === "Pending").length);
    document.getElementById("adminWelcome").textContent = `${admin.firstName} ${admin.lastName}`;

    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        app.logout();
      });
    });
  });
})();
