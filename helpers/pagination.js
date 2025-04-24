module.exports =  (query, objPagination, countProduct) => {
  if (query.page) {
      objPagination.currentPage = parseInt(query.page);
    }
    objPagination.skip = (objPagination.currentPage - 1) * objPagination.limit;

    const totalPage = Math.ceil(countProduct / objPagination.limit);
  objPagination.totalPage = totalPage;
  return objPagination
}