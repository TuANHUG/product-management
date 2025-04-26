// change status
const changeStatusButton = document.querySelectorAll("[button-change-status]");
if (changeStatusButton.length > 0) {
  const changeStatusForm = document.querySelector("#form-change-status");
  const path = changeStatusForm.getAttribute("data-path");

  changeStatusButton.forEach((button) => {
    button.addEventListener("click", () => {
      const currentStatus = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");
      let changeStatus = currentStatus === "active" ? "inactive" : "active";

      changeStatusForm.setAttribute(
        "action",
        `${path}/${changeStatus}/${id}?_method=PATCH`
      );
      changeStatusForm.submit();
    });
  });
}

// delete product
const deleteButtons = document.querySelectorAll("[button-delete]");

if (deleteButtons.length > 0) {
  const deleteForm = document.querySelector("#form-delete-item");
  const path = deleteForm.getAttribute("data-path");


  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const isConfirm = confirm(
        "Are you sure you want to delete this product?"
      );
      if (!isConfirm) return;

      deleteForm.action = `${path}/${id}?_method=DELETE`;
      deleteForm.submit();


    });
  });
}
