module.exports = (req, res, next) => {
    if (!req.user) res.status(401).send({error: 'must be logged in'});
    else next();
};
