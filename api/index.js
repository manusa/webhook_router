const api = (req, res) => {
  const { name = 'World' } = req.query
  res.status(200).send(`Hello ${name}!`)
}

module.exports = api;
