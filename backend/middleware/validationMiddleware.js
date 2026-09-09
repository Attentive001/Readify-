// Wraps a zod schema so routes can validate req.body declaratively:
//   router.post('/', validateBody(schema), controller)
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
