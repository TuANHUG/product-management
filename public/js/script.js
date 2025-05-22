// alert flash message
const flashMessage = document.querySelector("[show-alert]");
if (flashMessage) {
  const time = parseInt(flashMessage.getAttribute("data-time")) || 3000;

  // Tự động ẩn sau vài giây
  const timeout = setTimeout(() => {
    flashMessage.classList.add("alert-hidden");
  }, time);

  // Nếu click vào nút đóng thì ẩn luôn
  const closeButton = flashMessage.querySelector("[close-alert]");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      clearTimeout(timeout); // Xóa timeout tự động
      flashMessage.classList.add("alert-hidden");
    });
  }
}
