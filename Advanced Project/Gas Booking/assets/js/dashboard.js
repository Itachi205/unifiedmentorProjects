(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    const user = await app.requireAuth("consumer");
    if (!user) return;

    await app.syncAuthLinks();

    const bookings = await app.getBookingsByUser(user.id);
    const latestBooking = bookings[0];

    document.getElementById("dashboardName").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("bookingCount").textContent = String(bookings.length);
    document.getElementById("latestCylinder").textContent = latestBooking ? latestBooking.selenderType : "No booking yet";
    document.getElementById("latestStatus").textContent = latestBooking ? latestBooking.status : "Pending";

    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        app.logout();
      });
    });
  });
})();
