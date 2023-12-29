module.exports = function (app) {
    var AppController = require('../controllers/AppController');

    const { check } = require('express-validator');
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;

    function generateAccessToken(key) {
        // expires after half and hour (1800 seconds = 30 minutes)
        const accessToken = jwt.sign({ mobile: key }, JWT_SECRET, { expiresIn: '180000s' });
        return accessToken;
    }
    
    function authenticateToken(req, res, next) {
        // Gather the jwt access token from the request header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[0];

        //console.log(authHeader.split(' '));
        if (token == null) return res.sendStatus(401) // if there isn't any token
    
        jwt.verify(token, process.env.JWT_SECRET, (err, mobile) => {
          if (err) return res.sendStatus(401)
          req.token = generateAccessToken(mobile);
          next() // pass the execution off to whatever request the client intended
        })
    }

    app

    .post('/app/company-department-shift-list', [
        check('company').trim().isLength({ min: 1 }).withMessage('Company id required'),
    ], AppController.company_department_shift_list)

    .post('/app/create-employee', [
    ], AppController.create_employee)

    .post('/app/login-employee', [
        check('mobile').trim().isLength({ min: 1 }).withMessage('Enter mobile number'),
        check('password').trim().isLength({ min: 1 }).withMessage('Enter password')
    ], AppController.get_employee)

    .post('/app/employee-mark-attend', [
    ], authenticateToken, AppController.mark_attend)
}