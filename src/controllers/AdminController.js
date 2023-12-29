// Required Libraries
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const moment = require("moment");
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
const Subscription = require("../models/SubscriptionModel");

const storage = multer.diskStorage({
	destination: "./public", //this path shoud match as mentioned in app.js static path
	filename: function (req, file, cb) {
	cb(null, file.fieldname + "-" + Date.now()+path.extname(file.originalname));
	},
});
  
const maxSize = 25 * 1000 * 1000;
  
var upload = multer({
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
}).single("photo");

function createEmployees(categories) {

    const categoryList = [];
    for(let cate of categories){
        // console.log(cate);
        categoryList.push({
            id: cate._id,
            name: cate.name
        });
    }

    return categoryList;
}

module.exports = {

	/// Start User ///

	// Admin login
	login: function (req, res) {
		console.log(req.body,"Akash Roy")
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
			});
		} else {
			// console.log(req.body.email);
			var where = {};
			where["email"] = req.body.email;
			// Getting user according to email
			Admin.findOne(where)
				.then((user) => {
					if(user?.active == 0){
						res.status(200).send({
							status: "error",
							message: "Account is inactive",
						});
						return;
					}

					// Validating password
					bcryptjs.compare(
						req.body.password,
						user.password,
						function (err, result) {
							if (result == true) {
								const accessToken = jwt.sign({
										email: req.body.email
									},
									JWT_SECRET, {
										expiresIn: "180000s"
									}
								);
								res.status(200).send({
									status: "success",
									message: "Logged in",
									token: accessToken,
									result: user,
								});
							} else {
								res.status(200).send({
									status: "error",
									message: "Invalid password",
								});
							}
						}
					);
				})
				.catch((error) => {
					console.log(error);
					res.status(200).send({
						status: "error",
						message: "Invalid email",
					});
				});
		}
	},

	// Create Admin
	create_admin: function (req, res) {
		var where = {};
		where["mobile"] = req.body.mobile;
		// Checking user mobile number
		Admin.findOne(where)
			.then((response) => {
				if (response != null) {
					res.status(200).send({
						status: "error",
						message: "Mobile already in use.",
					});
				} else {
					var where = {};
					where["email"] = req.body.email;
					// Checking user email
					Admin.findOne(where)
						.then((response) => {
							if (response != null) {
								res.status(200).send({
									status: "error",
									message: "Email address already in use.",
								});
							} else {
								// // Generating password salt
								bcryptjs.genSalt(saltRounds, (err, salt) => {
									// Hashing password
									bcryptjs.hash(req.body.password, salt, (err, hash) => {
										var userData = new Admin({
											full_name: req.body.full_name,
											email: req.body.email,
											mobile: req.body.mobile,
											password: hash
										});
		
										userData.save(function (err, savedUser) {
											if (err) {
												res.status(200).send({
													status: "error",
													message: err,
													token: req.token,
												});
											} else {
												res.status(200).send({
													status: "success",
													message: "Account has been created successfully.",
													data: savedUser,
												});
											}
										});
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
				}
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid mobile",
				});
			});
	},

	// Create User
	create_user: function (req, res) {
		upload(req, res, function(error){
			if(error) {
				res.status(200).send({
					status: "error",
					message: "File size upto 10MB",
				});
			}else{
				var where = {};
				where["mobile"] = req.body.mobile;
				// Checking user mobile number
				Admin.findOne(where)
					.then((response) => {
						if (response != null) {
							res.status(200).send({
								status: "error",
								message: "Mobile already in use.",
							});
						} else {
							var where = {};
							where["email"] = req.body.email;
							// Checking user email
							Admin.findOne(where)
								.then((response) => {
									if (response != null) {
										res.status(200).send({
											status: "error",
											message: "Email address already in use.",
										});
									} else {
										bcryptjs.genSalt(saltRounds, (err, salt) => {
											// Hashing password
											bcryptjs.hash(req.body.password, salt, (err, hash) => {
												var userData = new Admin({
													full_name: req.body.full_name,
													email: req.body.email,
													mobile: req.body.mobile,
													user_type: "company",
													password: hash,
													profile_image: (!req.file)?"":req.file.path.replace(/\\/g,'/').replace('public', process.env.BASE_URL),
													active: 0
												});

												userData.save(function (err, savedUser) {
													if (err) {
														res.status(200).send({
															status: "error",
															message: err,
															token: req.token,
														});
													} else {
														res.status(200).send({
															status: "success",
															message: "Account has been created successfully.",
															data: savedUser,
														});
													}
												});
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
						}
					})
					.catch((error) => {
						res.status(200).send({
							status: "error",
							message: "Invalid mobile",
						});
					});
			}
		});
	},

	// Get all users
	user_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where["user_type"] = "company";

			Admin.find(where, null, {
                limit: parseInt(req.body.limit),
                skip: parseInt(req.body.page),
            })
			.populate("subscription_plan","plan_name")
            .sort({
                created_date: -1
            })
            .then((response) => {
                Admin.find(where).countDocuments(function (err, count) {
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    token: req.token,
                });
            });
		}
	},

	// Delete a user
	delete_user: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token
			});
			return;
		}
		var where = {};
		where["_id"] = req.body.id;
		Admin.deleteOne(where)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error,
					token: req.token,
				});
			});
	},

	// Get single user details
	get_profile: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		}
		Admin.findById(req.body.id)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token,
					result: response,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid user id",
					token: req.token,
				});
			});
	},

	// Change admin password
	change_password: function (req, res) {
		var where = {};
		where["_id"] = req.body.id;

		var updateData = {};
		updateData['updated_date'] = moment().format();

		bcryptjs.genSalt(saltRounds, (err, salt) => {
			bcryptjs.hash(req.body.password, salt, (err, hash) => {
				if(req.body.password != ""){
					updateData['password'] = hash;
				}

				Admin.findOneAndUpdate(
					where, updateData, {
						new: true
					}
				)
				.exec()
				.then((response) => {
					res.status(200).send({
						status: "success",
						message: "Password updated successfully",
						token: req.token,
					});
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: "Something went wrong",
						token: req.token,
					});
				});
			});
		});
	},

	// Update single user details
	update_profile: function (req, res) {
		upload(req, res, function(error){
			if(error) {
				res.status(200).send({
					status: "error",
					message: "File size upto 10MB",
				});
			}else{
				var where = {};
				where["_id"] = req.body.id;

				var updateData = {};
				updateData['updated_date'] = moment().format();

				if(req.body.full_name && req.body.full_name !== ""){
					updateData['full_name'] = req.body.full_name;
				}
				if(req.body.email && req.body.email !== ""){
					updateData['email'] = req.body.email;
				}
				if(req.body.mobile && req.body.mobile !== ""){
					updateData['mobile'] = req.body.mobile;
				}
				if(req.body.subscription_till && req.body.subscription_till !== ""){
					updateData['subscription_till'] = moment(req.body.subscription_till).format();
				}

				if(req.file){
					updateData['profile_image'] = req.file.path;
				}else{
					updateData['profile_image'] = req.body.old_image;
				}

				Admin.findOneAndUpdate(
					where, updateData, {
						new: true
					}
				)
				.exec()
				.then((response) => {
					res.status(200).send({
						status: "success",
						message: "Profile has been updated.",
						token: req.token,
					});
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: "Something went wrong",
						token: req.token,
					});
				});
			}
		});
	},

	// Update single user account status (Activate or Deactivate)
	update_user_status: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where["_id"] = req.body.id;
			Admin.findOneAndUpdate(
				where, {
					active: req.body.status,
					updated_date: moment().format(),
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Profile has been updated.",
					token: req.token,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong",
					token: req.token,
				});
			});
		}
	},

	// Update user subscription
	update_user_subscription: function (req, res) {
		var where = {};
		where["_id"] = req.body.id;
		Subscription.findOne({ _id: req.body.subscription_plan })
			.then((plan) => {
				if(plan == null) {
					res.status(200).send({
						status: "error",
						message: "No Plan Found"
					});
					return;
				}

				Admin.findOne(where)
				.then(company => {
					if(company == null) {
						res.status(200).send({
							status: "error",
							message: "Company Not Found"
						});
						return;
					}

					Admin.findOneAndUpdate(
						where, {
							subscription_plan: req.body.subscription_plan,
							subscription_till: moment(company.subscription_till).add(plan.duration,'days').format(),
							updated_date: moment().format()
						}, {
							new: true
						}
					)
					.exec()
					.then((response) => {
						res.status(200).send({
							status: "success",
							message: "Subscription Plan has been updated."
						});
					})
					.catch((error) => {
						res.status(200).send({
							status: "error",
							message: "Something went wrong"
						});
					});
				}).catch(err => {
					res.status(200).send({
						status: "error",
						message: "Invalid Company Id"
					});
				});				
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid subscription id",
					token: req.token,
				});
			});
	},

	/// End User ///

	/// Start Subscription ///

	// Create subscription plan
	create_subscription_plan: function (req, res) {
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		} 
		var where = {};
		where["plan_name"] = req.body.plan_name;
		// Checking plan existance
		Subscription.findOne(where)
			.then((response) => {
				if (response != null) {
					res.status(200).send({
						status: "error",
						message: "Plan already exists."
					});
				} else {
					var subscriptionData = new Subscription({
						plan_name: req.body.plan_name,
						price: req.body.price,
						duration: req.body.duration
					});

					subscriptionData.save(function (err, savedData) {
						if (err) {
							res.status(200).send({
								status: "error",
								message: err,
								token: req.token,
							});
						} else {
							res.status(200).send({
								status: "success",
								message: "Plan has been successfully created.",
								data: savedData,
							});
						}
					});
				}
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid plan",
				});
			});
	},

	// Get all subscription plan
	subscription_plan_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			Subscription.find()
				.then((response) => {
					res.status(200).send({
						status: "success",
						token: req.token,
						result: response
					});
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: error,
						token: req.token,
					});
				});
		}
	},

	// Get single subscription plan details
	get_subscription_plan: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		}
		Subscription.findById(req.body.id)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token,
					result: response,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid user id",
					token: req.token,
				});
			});
	},

	// Update subscription plan details
	update_subscription_plan_details: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array()
			});
		} else {
			var where = {};
			var updateData = {};
			where["_id"] = req.body.id;

			if(req.body.plan_name && req.body.plan_name !== ""){
				updateData["plan_name"] = req.body.plan_name;
			}

			if(req.body.price && req.body.price !== ""){
				updateData["price"] = req.body.price;
			}

			if(req.body.duration && req.body.duration !== ""){
				updateData["duration"] = req.body.duration;
			}

			Subscription.findOneAndUpdate(
				where, updateData, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Plan has been updated."
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong"
				});
			});
		}
	},

	// Delete a subscription plan
	delete_subscription_plan: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token
			});
			return;
		}
		var where = {};
		where["_id"] = req.body.id;
		Subscription.deleteOne(where)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error
				});
			});
	},

	/// End Subscription ///

	/// Start Department ///

	// Create department
	create_department: function (req, res) {
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		} 

		Admin.findOne({ _id: req.body.id })
		.then(company => {
			if(company == null) {
				res.status(200).send({
					status: "error",
					message: "Company does not exists.",
				});
				return;
			}

			var where = {};
			where["name"] = req.body.name;
			where["company"] = req.body.id;
			// Checking plan existance
			Department.findOne(where)
				.then((response) => {
					if (response != null) {
						res.status(200).send({
							status: "error",
							message: "Department already exists.",
						});
					} else {
						var departmentData = new Department({
							name: req.body.name,
							company: req.body.id
						});

						departmentData.save(function (err, savedData) {
							if (err) {
								res.status(200).send({
									status: "error",
									message: err,
									token: req.token,
								});
							} else {
								res.status(200).send({
									status: "success",
									message: "Department has been successfully created.",
									data: savedData,
								});
							}
						});
					}
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: "Invalid department",
					});
				});
		}).catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid Company",
				});
			});
	},

	// Get all departments
	department_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			if(req.body.id && req.body.id != "") {
				where['company'] = req.body.id;
			}
			where['deleted'] = 0;
			Department.find(where)
				.populate('company', "full_name")
				.then((response) => {
					res.status(200).send({
						status: "success",
						token: req.token,
						result: response
					});
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: error,
						token: req.token,
					});
				});
		}
	},

	// Get single department
	get_department: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		}
		Department.findById(req.body.id)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token,
					result: response,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid user id",
					token: req.token,
				});
			});
	},

	// Update department
	update_department: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where["_id"] = req.body.id;
			Department.findOneAndUpdate(
				where, {
					name: req.body.name,
					updated_date: moment().format()
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Department has been updated.",
					token: req.token,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong",
					token: req.token,
				});
			});
		}
	},

	// Delete a department
	delete_department: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token
			});
			return;
		}
		var where = {};
		where["_id"] = req.body.id;
		Department.findOneAndUpdate(
			where, {
				deleted: 1
			}, {
				new: true
			}
		)
		.exec()
		.then((response) => {
			res.status(200).send({
				status: "success",
				message: "Department deleted successfully.",
				token: req.token,
			});
		})
		.catch((error) => {
			res.status(200).send({
				status: "error",
				message: "Something went wrong",
				token: req.token,
			});
		});
	},

	/// End Department ///

	/// Start Shift ///

	// Create shift
	create_shift: function (req, res) {
		const errors = validationResult(req);
		// Checking fields validation errors
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		} 
		var where = {};
		where["name"] = req.body.name;
		where["company"] = req.body.id;
		// Checking plan existance
		Shift.findOne(where)
			.then((response) => {
				if (response != null) {
					res.status(200).send({
						status: "error",
						message: "Shift already exists.",
					});
				} else {
					var shiftData = new Shift({
						company: req.body.id,
						name: req.body.name,
						from: req.body.from,
						to: req.body.to
					});

					shiftData.save(function (err, savedData) {
						if (err) {
							res.status(200).send({
								status: "error",
								message: err,
								token: req.token,
							});
						} else {
							res.status(200).send({
								status: "success",
								message: "Shift has been successfully created.",
								data: savedData,
							});
						}
					});
				}
			})
			.catch((error) => {
				console.log(error);
				res.status(200).send({
					status: "error",
					message: "Invalid shift",
				});
			});
	},

	// Get all shifts
	shift_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			if(req.body.id && req.body.id != "") {
				where['company'] = req.body.id;
			}
			where['deleted'] = 0;
			Shift.find(where)
			.populate("company","full_name")
				.then((response) => {
					res.status(200).send({
						status: "success",
						token: req.token,
						result: response
					});
				})
				.catch((error) => {
					res.status(200).send({
						status: "error",
						message: error,
						token: req.token,
					});
				});
		}
	},

	// Get single shift
	get_shift: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
			return;
		}
		Shift.findById(req.body.id)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token,
					result: response,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid user id",
					token: req.token,
				});
			});
	},

	// Update shift
	update_shift: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where["_id"] = req.body.id;
			Shift.findOneAndUpdate(
				where, {
					name: req.body.name,
					from: req.body.from,
					to: req.body.to,
					updated_date: moment().format()
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Shift has been updated.",
					token: req.token,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong",
					token: req.token,
				});
			});
		}
	},

	// Delete a shift
	delete_shift: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token
			});
			return;
		}
		var where = {};
		where["_id"] = req.body.id;
		Shift.findOneAndUpdate(
			where, {
				deleted: 1
			}, {
				new: true
			}
		)
		.exec()
		.then((response) => {
			res.status(200).send({
				status: "success",
				message: "Shift deleted successfully.",
				token: req.token,
			});
		})
		.catch((error) => {
			res.status(200).send({
				status: "error",
				message: "Something went wrong",
				token: req.token,
			});
		});
	},

	/// End Shift ///

	/// Start Employee ///

	// Get all employees
	employee_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where['deleted'] = 0;

			if(req.body.name != ""){
				where['name'] = {
					$regex: ".*" + req.body.name,
					$options: "i"
				};
			}

			if(req.body.id != ""){
				where['company'] = req.body.id;
			}

			Employee.find(where, null, {
				limit: parseInt(req.body.limit),
				skip: parseInt(req.body.page),
			})
			.sort({
				created_date: -1
			})
			.populate("company", "full_name")
			.populate("department", "name")
			.populate("shift", "name")
			.then((response) => {
				Employee.find(where).countDocuments(function (err, count) {
					res.status(200).send({
						status: "success",
						token: req.token,
						result: response,
						totalCount: count
					});
				});
			})
			.catch((error) => {
				console.log(error)
				res.status(200).send({
					status: "error",
					message: error,
					token: req.token,
				});
			});
		}
	},

	select_employee_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where['deleted'] = 0;

			if(req.body.id != ""){
				where['company'] = req.body.id;
			}

			if(req.body.name != ""){
				where['name'] = {
					$regex: ".*" + req.body.name,
					$options: "i"
				};
			}

			Employee.find(where, null, {
				limit: parseInt(req.body.limit),
				skip: parseInt(req.body.page),
			})
			.sort({
				created_date: -1
			})
			.then((response) => {

				const employeeList = createEmployees(response);

				res.status(200).send({
					status: "success",
					result: employeeList
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error,
					token: req.token,
				});
			});
		}
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
		Employee.findById(req.body.id)
			.then((response) => {
				res.status(200).send({
					status: "success",
					token: req.token,
					result: response,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Invalid user id",
					token: req.token,
				});
			});
	},

	// Update single employee account status (Activate or Deactivate)
	update_employee_status: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where["_id"] = req.body.id;
			Employee.findOneAndUpdate(
				where, {
					active: req.body.status,
					updated_date: moment().format(),
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Employeey status has been updated.",
					token: req.token,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong",
					token: req.token,
				});
			});
		}
	},

	// Delete a employee
	delete_employee: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token
			});
			return;
		}
		var where = {};
		where["_id"] = req.body.id;
		Employee.findOneAndUpdate(
			where, {
				deleted: 1
			}, {
				new: true
			}
		)
		.exec()
		.then((response) => {
			res.status(200).send({
				status: "success",
				message: "Employee deleted successfully.",
				token: req.token,
			});
		})
		.catch((error) => {
			res.status(200).send({
				status: "error",
				message: "Something went wrong",
				token: req.token,
			});
		});
	},

	// Update employee
	update_employee: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};
			where["_id"] = req.body.id;
			Employee.findOneAndUpdate(
				where, {
					name: req.body.name,
					company: req.body.company,
					department: req.body.department,
					shift: req.body.shift,
					designation: req.body.designation,
					updated_date: moment().format()
				}, {
					new: true
				}
			)
			.exec()
			.then((response) => {
				res.status(200).send({
					status: "success",
					message: "Employee details has been updated.",
					token: req.token,
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: "Something went wrong",
					token: req.token,
				});
			});
		}
	},

	/// End Employee ///

	/// Start Employee Attendance ///

	// Get all employees
	employee_attendance_list: function (req, res) {
		const errors = validationResult(req);
		if (Object.keys(errors.array()).length > 0) {
			res.status(200).send({
				status: "validation_error",
				errors: errors.array(),
				token: req.token,
			});
		} else {
			var where = {};

			if(req.body.employee && req.body.employee !== ""){
				where['employee'] = req.body.employee;
			}

			if(req.body.id && req.body.id !== ""){
				where['company'] = req.body.id;
			}

			if(req.body.start !== "" && req.body.end !== ""){
				where['created_date'] = {
					$gte: moment(req.body.start).format(),
					$lt: moment(req.body.end).format()
				}
			}

			Attend.find(where, null, {
				limit: parseInt(req.body.limit),
				skip: parseInt(req.body.page),
			})
			.sort({
				created_date: -1
			})
			.populate("employee", "name email mobile")
			.then((response) => {
				Attend.find(where).countDocuments(function (err, count) {
					res.status(200).send({
						status: "success",
						token: req.token,
						result: response,
						totalCount: count
					});
				});
			})
			.catch((error) => {
				res.status(200).send({
					status: "error",
					message: error,
					token: req.token,
				});
			});
		}
	},

	/// Start Employee Attendance ///
}