(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    const user = await app.requireAuth("consumer");
    if (!user) return;

    await app.syncAuthLinks();

    document.getElementById("bookingFullName").value = `${user.firstName} ${user.lastName}`;
    document.getElementById("bookingNotice").textContent = "";

    document.getElementById("bookingForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const booking = {
        id: app.createId("BKG"),
        userId: user.id,
        name: document.getElementById("bookingFullName").value.trim(),
        unNumber: document.getElementById("bookingUNNumber").value.trim(),
        selenderType: document.getElementById("bookingCylinder").value,
        address: document.getElementById("bookingAddress").value.trim(),
        postalCode: document.getElementById("bookingPostalCode").value.trim(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      if (!booking.name || !booking.unNumber || !booking.address || !booking.postalCode) {
        app.showNotice(document.getElementById("bookingNotice"), "Please complete all booking details.", "error");
        return;
      }

      await app.createBooking(booking);
      app.showNotice(document.getElementById("bookingNotice"), "Cylinder booked successfully.", "success");
      event.target.reset();
      document.getElementById("bookingFullName").value = `${user.firstName} ${user.lastName}`;
      document.getElementById("bookingCylinder").value = "32KG";
    });
  });
})();
