module.exports = function (app) {
    var AdminController = require('../controllers/AdminController');

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

    /// Create Admin 
    .post('/admin/create-super-admin', [
    ], AdminController.create_admin)

    .post('/admin/change-password', [
    ], authenticateToken, AdminController.change_password)

    /// Subscription Plan Start ///

    .post('/admin/create-subscription-plan', [
        check('plan_name').trim().isLength({ min: 1 }).withMessage('Enter Plan Name'),
        check('price').trim().isLength({ min: 1 }).withMessage('Enter Plan Price'),
        check('duration').trim().isLength({ min: 1 }).withMessage('Enter Plan Duration')
    ], authenticateToken, AdminController.create_subscription_plan)

    .post('/admin/subscription-plan-list', [
    ], authenticateToken, AdminController.subscription_plan_list)

    .post('/admin/get-subscription-plan', [
    ], authenticateToken, AdminController.get_subscription_plan)

    .post('/admin/update-subscription-plan', [
        check('plan_name').trim().isLength({ min: 1 }).withMessage('Enter Plan Name'),
        check('price').trim().isLength({ min: 1 }).withMessage('Enter Plan Price'),
        check('duration').trim().isLength({ min: 1 }).withMessage('Enter Plan Duration')
    ], authenticateToken, AdminController.update_subscription_plan_details)

    .post('/admin/delete-subscription-plan', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter subscription plan id'),
    ], authenticateToken, AdminController.delete_subscription_plan)

    /// Subscription Plan Ends ///
    
    /// Company Start ///

    .post('/admin/login', [
        check('email').trim().isLength({ min: 1 }).withMessage('Enter email address').isEmail().withMessage('Invalid email address'),
        check('password').trim().isLength({ min: 1 }).withMessage('Enter password')
    ], AdminController.login)
  
    .post('/admin/create-user', [
    ], authenticateToken, AdminController.create_user)

    .post('/admin/user-list', [
    ], authenticateToken, AdminController.user_list)

    .post('/admin/delete-user', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter user id'),
      ], authenticateToken, AdminController.delete_user)

    .post('/admin/get-profile', [
    ], authenticateToken, AdminController.get_profile)

    .post('/admin/update-user-subscription', [
    ], authenticateToken, AdminController.update_user_subscription)

    .post('/admin/update-profile', [
        check('full_name').trim().isLength({ min: 1 }).withMessage('Enter name'),
        check('email').trim().isLength({ min: 1 }).withMessage('Enter email address').isEmail().withMessage('Invalid email address'),
        check('mobile').trim().isLength({ min: 1 }).withMessage('Enter mobile number')
    ], authenticateToken, AdminController.update_profile)

    .post('/admin/update-user-status', [
    ], authenticateToken, AdminController.update_user_status)

    /// Company Ends ///

    /// Deaprtment Start ///

    .post('/admin/create-department', [
        check('name').trim().isLength({ min: 1 }).withMessage('Enter department name')
    ], authenticateToken, AdminController.create_department)

    .post('/admin/department-list', [
    ], authenticateToken, AdminController.department_list)

    .post('/admin/delete-department', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter department id'),
      ], authenticateToken, AdminController.delete_department)

    .post('/admin/get-department', [
    ], authenticateToken, AdminController.get_department)

    .post('/admin/update-department', [
        check('name').trim().isLength({ min: 1 }).withMessage('Enter department name')
    ], authenticateToken, AdminController.update_department)

    /// Deaprtment End ///

    /// Shift Start ///

    .post('/admin/create-shift', [
        check('from').trim().isLength({ min: 1 }).withMessage('Enter shift from'),
        check('to').trim().isLength({ min: 1 }).withMessage('Enter shift to')
    ], authenticateToken, AdminController.create_shift)

    .post('/admin/shift-list', [
    ], authenticateToken, AdminController.shift_list)

    .post('/admin/delete-shift', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter shift id'),
      ], authenticateToken, AdminController.delete_shift)

    .post('/admin/get-shift', [
    ], authenticateToken, AdminController.get_shift)

    .post('/admin/update-shift', [
        check('from').trim().isLength({ min: 1 }).withMessage('Enter shift from'),
        check('to').trim().isLength({ min: 1 }).withMessage('Enter shift to')
    ], authenticateToken, AdminController.update_shift)

    /// Shift End ///

    /// Employee Start ///

    .post('/admin/employee-list', [
    ], authenticateToken, AdminController.employee_list)

    .post('/admin/select-employee-list', [
    ], AdminController.select_employee_list)

    .post('/admin/delete-employee', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter employee id'),
      ], authenticateToken, AdminController.delete_employee)

    .post('/admin/get-employee', [
    ], authenticateToken, AdminController.get_employee)

    .post('/admin/update-employee-status', [
    ], authenticateToken, AdminController.update_employee_status)

    .post('/admin/update-employee', [
        check('name').trim().isLength({ min: 1 }).withMessage('Enter employee from'),
        check('company').trim().isLength({ min: 1 }).withMessage('Enter employee company'),
        check('department').trim().isLength({ min: 1 }).withMessage('Enter employee department'),
        check('shift').trim().isLength({ min: 1 }).withMessage('Enter employee shift'),
        check('designation').trim().isLength({ min: 1 }).withMessage('Enter employee designation')
    ], authenticateToken, AdminController.update_employee)

    /// Employee End ///

    /// Employee Attend Start ///

    .post('/admin/employee-attend-list', [
    ], authenticateToken, AdminController.employee_attendance_list)
    
    /// Employee Attend Start ///
}