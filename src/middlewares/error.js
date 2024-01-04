const errValidator = (err) => {
  let errList = [];
  for (let e in err.errors) {
    errList.push(err.errors[e].message);
  }
  return errList.join(', ');
};

module.exports = (err, req, res, next) => {
  console.log(err);
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  if (err.name === 'ValidationError') {
    message = errValidator(err);
    status = 401;
    res.status(401).json({ message, status });
  } else if (err.message === "Cannot read property 'salt' of undefined") {
    res.status(403).json({ Error: 'Missing jwt to be decoded' });
  } else if (err.message.search(/duplicate/g) != -1) {
    res.status(401).json({
      message: `${Object.keys(err.keyValue)[0]} ${err.keyValue[Object.keys(err.keyValue)[0]]
        } sudah terdaftar, silahkan gunakan ${Object.keys(err.keyValue)[0]} lain`,
      status: 401,
    });
  } else if (
    err.name === 'Malformed UTF-8 data' ||
    err.message === 'Malformed UTF-8 data'
  ) {
    res.status(403).json({ Error: 'Token Expired silahkan login kembali' });
  } else {
    res.status(status).json({ message, ...err, status: status });
  }
};