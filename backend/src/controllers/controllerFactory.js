// Generic controller factory — wraps a service method in try/catch
const makeController = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    if (result !== undefined) {
      res.json({ success: true, data: result });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { makeController };
