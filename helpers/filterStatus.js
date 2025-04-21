// change class for status filter button for admin page
module.exports = (query) => {
  let filterStatus = [
    {
      name: "Tất cả",
      status: "",
      class: "",
    },
    {
      name: "Đang hoạt động",
      status: "active",
      class: "",
    },
    {
      name: "Ngừng hoạt động",
      status: "inactive",
      class: "",
    },
  ];

  if (query.status) {
    const filter = filterStatus.find((item) => item.status === query.status);
    if (filter) {
      filter.class = "active";
    }
  } else {
    filterStatus[0].class = "active";
  }

  return filterStatus;
}