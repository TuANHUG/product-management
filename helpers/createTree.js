module.exports = (arr, parent_id = "") => {
  let count = 0;

  const createTree = (arr, parent_id = "") => {
    const tree = [];
    arr.forEach((item) => {
      if (item.parent_id === parent_id) {
        const newItem = { ...item };
        newItem.index = ++count;
        const children = createTree(arr, newItem._id.toString());
        if (children.length) {
          newItem.children = children;
        }
        tree.push(newItem);
      }
    });
    return tree;
  };

  return createTree(arr, parent_id);
};
