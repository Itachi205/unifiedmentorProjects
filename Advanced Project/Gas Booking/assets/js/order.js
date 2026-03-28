(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    const user = await app.requireAuth("consumer");
    if (!user) return;

    await app.syncAuthLinks();

    const tableBody = document.getElementById("orderTable");
    const bookings = await app.getBookingsByUser(user.id);

    if (!bookings.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No cylinder bookings found yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = bookings
      .map(
        (booking) => `
          <tr>
            <td>${booking.id}</td>
            <td>${booking.name}</td>
            <td>${booking.unNumber}</td>
            <td>${booking.selenderType}</td>
            <td>${booking.address}</td>
            <td>${booking.status}</td>
          </tr>
        `
      )
      .join("");
  });
})();
