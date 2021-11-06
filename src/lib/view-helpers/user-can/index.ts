export default (permission, options) => {
  const user = options.data.root.user;
  if (!user) {
    return false;
  }
  return user.permissions.includes(permission);
};
