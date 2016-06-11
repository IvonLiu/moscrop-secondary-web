exports.error = function(res, err) {
  console.error(err.stack);
  res.status(400).render('error', { error: err });
};
