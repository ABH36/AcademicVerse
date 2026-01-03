const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

const verifyRecruiter = (req, res, next) => {
  if (req.user && (req.user.role === 'recruiter' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Recruiters Only' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Admins Only' });
  }
};

module.exports = { authorize, verifyRecruiter, verifyAdmin };