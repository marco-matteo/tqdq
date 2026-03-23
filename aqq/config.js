module.exports = {
    host: process.env.DBSERVER || 'localhost',
    user: process.env.DBUSER || 'root',
    password: process.env.DBPASSWORD || 'Some.Real.Secr3t',
    database: process.env.DBNAME || 'm183_lb2'
};
