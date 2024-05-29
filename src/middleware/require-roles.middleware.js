export const requiredRoles = (roles) => {
  return async (req, res, next) => {
      const { role } = req.user;
      if (roles.includes(role)) {
          return next();
      }
      return res.status(401).json({ status: 401, message: '접근 권한이 없습니다.' });
  };
};