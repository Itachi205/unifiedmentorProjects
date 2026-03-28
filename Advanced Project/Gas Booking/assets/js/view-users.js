(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    const admin = await app.requireAuth("admin");
    if (!admin) return;

    const tableBody = document.getElementById("userTable");
    const users = (await app.getUsers()).filter((user) => user.role !== "admin");

    if (!users.length) {
      tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No registered consumers found.</td></tr>';
      return;
    }

    tableBody.innerHTML = users
      .map(
        (user) => `
          <tr>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
          </tr>
        `
      )
      .join("");
  });
})();
