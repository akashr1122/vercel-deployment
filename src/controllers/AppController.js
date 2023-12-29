// Required Libraries
const { validationResult } = require("express-validator");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const multer = require("multer");
var path = require("path");

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
moment().format();
moment.suppressDeprecationWarnings = true;

// Required Models 
const Admin = require("../models/AdminModel");
const Department = require("../models/DepartmentModel");
const Shift = require("../models/ShiftModel");
const Employee = require("../models/EmployeeModel");
const Attend = require("../models/AttendModel");

const storage = multer.diskStorage({
	destination: "./public/employees", //this path shoud match as mentioned in app.js static path
	filename: function (req, file, cb) {
	cb(null, file.fieldname + "-" + Date.now()+path.extname(file.originalname));
	},
});

const attend_storage = multer.diskStorage({
	destination: "./public/employees/mark_attend", //this path shoud match as mentioned in app.js static path
	filename: function (req, file, cb) {
	cb(null, file.fieldname + "-" + Date.now()+path.extname(file.originalname));
	},
});
  
const maxSize = 25 * 1000 * 1000;

var employee_pics = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb){
		const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (allowedFileTypes.includes(file.mimetype)){
			cb(null, true);
		} else {
			cb(null, false);
		}
	}
// photo is the name of file attribute
}).array("photos", 12);

var mark_attend_pics = multer({
	storage: attend_storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb){
		const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (allowedFileTypes.includes(file.mimetype)){
			cb(null, true);
		} else {
			cb(null, false);
		}
	}
// photo is the name of file attribute
}).array("photos", 12);

module.exports = {

	// Get all companies, departments and shifts
	company_department_shift_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			Department.find({ deleted: 0, company: req.body.company })
			.then((responseDepartment) => {
				Shift.find({ deleted: 0, company: req.body.company })
				.then((response) => {
					res.status(200).send({
						status: "success",
						departments: responseDepartment,
						shifts: response
					});
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: error
					});
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error
				});
			});
		}
	},

    // Create employee
	create_employee: function (req, res) {
		employee_pics(req, res, function(error){
			if(error) {
				// console.log(error);
				res.status(200).send({
					status: "error",
					message: "File size upto 10MB",
				});
			}else{
				if(req.body.mobile.trim() != "" && req.body.email.trim() != ""){
					var whereEmail = {};
					whereEmail["email"] = req.body.email;
					// Checking plan existance
					Employee.findOne(whereEmail)
						.then((response) => {
							if (response != null) {
								res.status(200).send({
									status: "error",
									message: "Email already exists.",
								});
							} else {
								var whereMobile = {};
								whereMobile["mobile"] = req.body.mobile;

								Employee.findOne(whereMobile)
								.then((response) => {
									if (response != null) {
										res.status(200).send({
											status: "error",
											message: "Mobile already exists.",
										});
									} else {
										if(req.files && req.files.length > 0) {
											let photos = [];
						
											req.files.forEach(file => {
												photos.push({ file: file.path.replace(/\\/g,'/').replace('public', process.env.BASE_URL) });
											})

											if(req.body.company && req.body.company.trim() == ""){
												res.status(200).send({
													status: "error",
													message: "Company id required."
												});
												return;
											}

											// // Generating password salt
											bcryptjs.genSalt(saltRounds, (err, salt) => {
												// Hashing password
												bcryptjs.hash(req.body.password, salt, (err, hash) => {
													var employeeData = new Employee({
														name: req.body.name,
														company: req.body.company,
														department: req.body.department,
														shift: req.body.shift,
														mobile: req.body.mobile,
														email: req.body.email,
														designation: req.body.designation,
														password: hash,
														photos: photos,
														active: 0
													});
				
													employeeData.save(function (err, savedData) {
														if (err) {
															res.status(200).send({
																status: "error",
																message: err,
																token: req.token,
															});
														} else {
															res.status(200).send({
																status: "success",
																message: "Employee has been successfully created.",
																data: savedData,
															});
														}
													});
												});
											});
										}else{
											res.status(200).send({
												status: "error",
												message: "No pictures uploaded",
											});
										}
									}
								})
								.catch((error) => {
									res.status(200).send({
										status: "error",
										message: "Invalid mobile",
									});
								});
							}
						})
						.catch((error) => {
							res.status(200).send({
								status: "error",
								message: "Invalid email",
							});
						});
				}else{
					res.status(200).send({
						status: "error",
						message: "Email and mobile is required",
					});
				}
			}
		});
	},

	// Get single employee
	get_employee: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		}
		var where = {};
		where['mobile'] = req.body.mobile;
		Employee.findOne(where)
			.populate("company", "subscription_till")
			.then((response) => {
				if(response == null){
					res.status(200).send({
						status: "error",
						message: "User not found",
					});
					return;
				}

				if(response.active == 0){
					res.status(200).send({
						status: "error",
						message: "Account is inactive",
					});
					return;
				}

				if(response.company != null){
					if(moment().format("YYYYMMDD") <= moment(response.company.subscription_till).format("YYYYMMDD")){
						bcryptjs.compare(
							req.body.password,
							response.password,
							function (err, result) {
								if (result == true) {
									const accessToken = jwt.sign({
											mobile: req.body.mobile
										},
										JWT_SECRET, {
											expiresIn: "180000s"
										}
									);
									res.status(200).send({
										status: "success",
										message: "Logged in",
										token: accessToken,
										result: response,
									});
								} else {
									res.status(200).send({
										status: "error",
										message: "Invalid password",
									});
								}
							}
						);
					}else{
						res.status(200).send({
							status: "error",
							message: "Company Subscription Plan Expired.",
						});
					}
				}else{
					res.status(200).send({
						status: "error",
						message: "Invalid Company Id.",
					});
				}
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid user",
					token: req.token,
				});
			});
	},

	mark_attend: function (req, res) { 
		mark_attend_pics(req, res, function(error){
			if(error) {
				res.status(200).send({
					status: "error",
					message: "File size upto 10MB",
				});
			}else{
				if(req.files && req.files.length > 0) {
					Employee.findOne({ _id: req.body.employee, deleted: 0 })
					.then(employee => {
						if(employee == null){
							res.status(200).send({
								status: "error",
								message: "Employee Not Found",
							});
							return;
						}

						let photos = [];

						req.files.forEach(file => {
							photos.push({ file: file.path.replace(/\\/g,'/').replace('public', process.env.BASE_URL) });
						})
						
						var attendData = new Attend({
							employee: req.body.employee,
							company: employee.company,
							position: {
								coordinates: [req.body.latitude, req.body.longitude]
							},
							photos: photos
						});

						attendData.save(function (err, savedData) {
							if (err) {
								res.status(200).send({
									status: "error",
									message: err,
									token: req.token,
								});
							} else {
								res.status(200).send({
									status: "success",
									message: "Employee marked as attend.",
									data: savedData,
								});
							}
						});
					})
					.catch(err => {
						res.status(200).send({
							status: "error",
							message: "Invalid employee id",
						});
					});
				}else{
					res.status(200).send({
						status: "error",
						message: "No pictures uploaded",
					});
				}
			}
		});
	}
}