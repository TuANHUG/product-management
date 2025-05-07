// button status
const buttonStatus = document.querySelectorAll("[button-status]");
if (buttonStatus.length > 0) {
  let url = new URL(window.location.href);

  buttonStatus.forEach((button) => {
    button.addEventListener("click", (e) => {
      const status = button.getAttribute("button-status");

      if (status) {
        url.searchParams.set("status", status);
      } else {
        url.searchParams.delete("status");
      }
      window.location.href = url.href;
    });
  });
}
//end button status

// find product
const formSearch = document.querySelector("#form-search");
if (formSearch) {
  let url = new URL(window.location.href);

  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = e.target.elements.keyword.value;
    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
  });
}

// pagination
const buttonPagination = document.querySelectorAll("[button-pagination]");
if (buttonPagination) {
  let url = new URL(window.location.href);
  buttonPagination.forEach((button) => {
    button.addEventListener("click", (e) => {
      const page = button.getAttribute("button-pagination");
      if (page) {
        url.searchParams.set("page", page);
      } else {
        url.searchParams.delete("page");
      }
      window.location.href = url.href;
    });
  });
}

//checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputsId = checkboxMulti.querySelectorAll("input[name='id']");


  inputCheckAll.addEventListener("click", () => {
    if (inputCheckAll.checked) {
      inputsId.forEach((input) => {
        input.checked = true;
      });
    } else {
      inputsId.forEach((input) => {
        input.checked = false;
      });
    }
  });
  inputsId.forEach((input) => {
    input.addEventListener("click", () => {
      const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
      if (countChecked === inputsId.length) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }
    });
  });
}

//form change multi status
const formChangeMulti = document.querySelector("[form-change-multi]");

if (formChangeMulti) {
  formChangeMulti.addEventListener("submit", (e) => {
    e.preventDefault();

    const checkboxMulti = document.querySelector("[checkbox-multi]");
    const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

    const typeChange = e.target.elements.type.value;

    if (typeChange === "delete-all") { 
      const confirmDelete = confirm("Are you sure you want to delete all selected products?");
      if (!confirmDelete) {
        return;
      }
    }

    if (inputsChecked.length > 0) {
      let ids = [];
      const inputsId = formChangeMulti.querySelector("input[name='ids']");

      inputsChecked.forEach((input) => {
        if (typeChange === "change-position") {
          const position = input.closest("tr").querySelector("input[name='position']").value;
          ids.push(`${input.value}-${position}`);
        } else {
          ids.push(input.value);
        }
      });
      
      inputsId.value = ids.join(", ");
      formChangeMulti.submit();
      
    } else {
      alert("Please select at least one product to change status.");
      return;
    }
  
  });
}

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

//preview image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");

  uploadImageInput.addEventListener("change", (e) => {
    const [file] = e.target.files;
    if (file) {
      uploadImagePreview.src = URL.createObjectURL(file);
    }
  });
}

