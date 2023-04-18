const mySql = require('mysql2');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const db = mySql.createConnection(
    {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        port: process.env.DATABASE_PORT,
    }
);

// exports.addAccount = (req, res) => {
//     const { email, password, confirm_password } = req.body;

// if (!email || !password || !confirm_password) {
//     return res.render('register', {
//         message: "All fields are required"
//     });
// }

// if (password !== confirm_password) {
//     return res.render('register', {
//         message: "Passwords does not match"
//     });
// }

// // const upperCasefName = fName.toUpperCase();
// // const upperCaselName = lName.toUpperCase();

// db.query(`SELECT * FROM admin WHERE email = ?`, [email], 
// async (err, data) => {
//     if (err) {
//         console.log(`Error: ${err}`);
//         return res.render('register', {
//             message: "Error Occurred"
//         });
//     } else {
//         if (data.length > 0) {
//             return res.render('register', {
//                 message: "User Account Already Exist"
//             });
//         } else {
//             const hashPassword = await encrypt.hash(password, 10)
//             console.log(hashPassword)
//             db.query(`INSERT INTO admin SET ?`, [{
//                 email: email,
//                 password: hashPassword
//             }], (err, result) => {
//                 if (err) {
//                     console.log(`Error: ${err}`);
//                     return res.render('register', {
//                         message: "Error Occurred"
//                     });
//                 } else {
//                     console.log(result);
//                     return res.render('register', {
//                         message: "User Account Has Been Added Successfully"
//                     });
//                 }
//             });
//         }
//     }
// });
// }

exports.loginAccount = async (req, res) => {
    try {
        const { email, password} = req.body;
        if(!email || !password){
            res.render('index', {
                message: 'Fields cannot be empty'
            });
        } else {
            db.query('SELECT * FROM admin WHERE email = ?', [email],
            async(err, data) => {
                if(!data[0]){
                    res.render('index', {
                        message: 'Email is incorrect'
                    })
                } else if (!(await encrypt.compare(password, data[0].password))) {
                    res.render('index', {
                        message:'Password is incorrect'
                    })
                } else {
                    const admin_id = data[0].admin_id;
                    const token = jwt.sign(admin_id, process.env.JWT_SECRET)
                    const cookieOption = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000) ,
                        httpOnly: true 
                    }
                    res.cookie('cookie_access_token', token, cookieOption)
                    // console.log(`This is the cookie = ${JSON.stringify(cookieOption)}`)
                    // console.log(`This is the token = ${token}`)
                    db.query('SELECT students.*, courses.course_name FROM students INNER JOIN courses ON students.course_id = courses.course_id ORDER BY students.last_name ASC', (err, data) => {
                        if(err){
                            console.log(`Error Message: ${err}`)
                        } else if (!data) {
                            res.render('viewAccounts', {
                                message: 'No results found'
                            })
                        } else {
                            res.render('viewAccounts', {
                                title: 'List of Students',
                                data: data
                            })
                        }
                    })
                }
            })
        }
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

exports.addStudentForm = (req, res) => {
    res.render('addStudent', {
        title: 'Add Student'
    });
};

exports.addStudent = (req, res, next) => {
    const { fName, lName, email, courses } = req.body;

    if(!fName || !lName || !email || !courses){
        res.render('addStudent', {
            title: 'Add Student',
            message: 'Fields cannot be empty'
        })
    }

    db.query('INSERT INTO students (first_name, last_name, email, course_id) VALUES (?, ?, ?, ?)', [ fName, lName, email, courses],
    (err, data) => {
        if(err) {
            console.log(`Error: ${err}`);
            return res.render('addStudent', {
                title: 'Add Student',
                message: 'Error Occured'
            })
        } else {
            console.log(data);
            return res.render('addStudent', {
                title: 'Add Student',
                message: 'Student Added Successfully'
            })
        }
        
    })
}

exports.backButton = (req, res) => {
    db.query('SELECT students.*, courses.course_name FROM students INNER JOIN courses ON students.course_id = courses.course_id ORDER BY students.last_name ASC', (err, data) => {
        if(err){
            console.log(`Error Message: ${err}`)
        } else {
            res.render('viewAccounts', {
                title: 'List of Students',
                data: data
            })
        }
    })
};




exports.updateForm = (req, res) => {
    const student_id = req.params.student_id;
    console.log(student_id)

    db.query('SELECT * FROM students WHERE student_id = ?', [student_id],
    (err, data) => {
        if (err) {
            console.log(`Error message: ${err}`)
        } else {
            res.render('updateForm',{
                title: 'Update User Account',
                data: data[0]
            });
        }
    })
}

exports.updateUser = (req, res) => {
    
    const {fName, lName, student_id} = req.body;

    db.query('UPDATE students SET first_name = ?, last_name = ? WHERE student_id = ?', [fName, lName, student_id],
    (err, data) => {
        if(err){
            console.log(`Error message: ${err}`)
        } else {
            db.query('SELECT * FROM students', (err, data) => {
                if (err) {
                    console.log(`Error Message: ${err}`)
                } else if (!data){
                    res.render('viewAccounts', {
                        message: 'No results found'
                    })
                } else {
                    res.render('viewAccounts', {
                        title: 'List of Students',
                        data:data
                    })
                }
            })
        }
    })
}

exports.deleteUser = (req, res) => {
    const student_id = req.params.student_id;
  
    db.query("DELETE FROM students WHERE student_id = ?", [student_id], 
    (err, data) => {
        if (err) {
            console.log(`Error message: ${err}`);
        } else {
            db.query('SELECT * FROM students', (err, data) => {
                if (err) {
                    console.log(`Error Message: ${err}`);
                } else if (!data) {
                    res.render('viewAccounts', {
                        message: 'No results found'
                    });
                } else {
                    res.render('viewAccounts', {
                        title: 'List of Students',
                        data: data
                    });
                }
            });
        }
    });
};

exports.logoutAccount = (req, res) => {
    
    res.clearCookie(`cookie_access_token`).status(200);
    res.render('index')
  };
  
