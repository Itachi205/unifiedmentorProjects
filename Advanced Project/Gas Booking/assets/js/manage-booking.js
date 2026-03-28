(function () {
  const app = window.GasApp;

  async function renderRows() {
    const tableBody = document.getElementById("bookingTable");
    const bookings = await app.getBookings();

    if (!bookings.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No bookings have been placed yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = bookings
      .map(
        (booking) => `
          <tr>
            <td>${booking.name}</td>
            <td>${booking.unNumber}</td>
            <td>${booking.selenderType}</td>
            <td>${booking.address}</td>
            <td>${booking.postalCode}</td>
            <td>
              <select data-booking-status="${booking.id}" class="table-select">
                <option value="Pending" ${booking.status === "Pending" ? "selected" : ""}>Pending</option>
                <option value="Approved" ${booking.status === "Approved" ? "selected" : ""}>Approved</option>
                <option value="Delivered" ${booking.status === "Delivered" ? "selected" : ""}>Delivered</option>
              </select>
            </td>
          </tr>
        `
      )
      .join("");

    tableBody.querySelectorAll("[data-booking-status]").forEach((select) => {
      select.addEventListener("change", async () => {
        const target = bookings.find((booking) => booking.id === select.dataset.bookingStatus);
        if (!target) return;
        target.status = select.value;
        await app.updateBooking(target.id, { status: target.status });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const admin = await app.requireAuth("admin");
    if (!admin) return;
    await renderRows();
  });
})();
