const express = require('express'),
app = express(),
port = process.env.PORT || 3000,
session = require('express-session');

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// SET SESSION
app.use(session({
    secret: 'Lokesh Da',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));

const { F_Select } = require('./controller');

// GET REQUEST
app.get('/', (req, res) => {
    res.send('Helo!! Demo app is running...')
})

// HANDLE GET REQUEST WITH QUERY STRING //
app.get('/q_user_name', (req, res) => {
    // ex: http://localhost:3000/user_name?fname=Subham&lname=Samanta
    var fname = req.query.fname,
        lname = req.query.lname;
    var result = `Hi, ${fname} ${lname}`
    res.send(result).status(200)
})

// Handle get request with parameter string //
app.get('/p_user_name/:fname/:lname', (req, res) => {
    // ex: http://localhost:3000/puser_name/Subham/Samanta
    var fname = req.params.fname,
        lname = req.params.lname;
    var result = `Hi, ${fname} ${lname}`
    res.send(result).status(200)
})


app.get('/dashboard', function(req, res, next){
    res.sendFile(__dirname + '/index.html');
});

app.post('/test_fetch_data', (req, res) => {
    var dbString = {
        1: {
            user: 'gardbcfs',
            password: 'gardbcfs71101',
            connectionString: '202.65.156.246:1521/orcl',
            poolMax: 10,
            poolMin: 10,
            poolIncrement: 0
        },
        2: {
            user: 'ddccbeccs',
            password: 'ddccbeccs41101',
            connectionString: 'synergic-db1.ckoqkwog5p58.ap-south-1.rds.amazonaws.com:1521/syndb1',
            poolMax: 10,
            poolMin: 10,
            poolIncrement: 0
        }
    }
    var id = req.body.selectdb
    req.session.dbString = dbString[id]
    res.sendFile(__dirname + '/get_result.html');
})

app.get('/get_result', async (req, res) => {
   // res.json(req.session.dbString)
    var dbString = req.session.dbString
    var fields = '*',
        table_name = 'td_pay_slip',
        where = null,
        order = null,
        flag = 1;
    var res_dt = await F_Select(dbString, fields, table_name, where, order, flag)
    res.send(res_dt)
})

// Handle post request. Use POSTMAN to initiate this method //
app.post('/user',async (req, res) => {
    //let username = request.body.username;
     fname = req.body.selectdb;
            const oracledb = require('oracledb'),
            path = require('path');
            console.log(path.join(__dirname, 'instantclient'));
            oracledb.autoCommit = true;
  
        var dbString = {
            user: 'gardbcfs',
            password: 'gardbcfs71101',
            connectionString: '202.65.156.246:1521/orcl',
            poolMax: 10,
            poolMin: 10,
            poolIncrement: 0
        }
  
            

    // FUNCTION FOR EXICUTE SELECT QUERY AND RETURN RESULT
    const D_Select = (fields, table_name, where, order, flag) => {
        return new Promise(async (resolve, reject) => {
            where = where ? `WHERE ${where}` : '';
            order = order ? order : '';
            // console.log(dbString);

            // CREATE DB CONNECTION
            const pool = await oracledb.createPool(dbString);
            const con = await pool.getConnection();
            // END
            // SQL QUERY
            let sql = `SELECT ${fields} FROM ${table_name} ${where} ${order}`
            // console.log(sql);

            // EXICUTE QUERY
            const result = await con.execute(sql, [], {
                resultSet: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            // END

            // STORE RESULT SET IN A VARIABLE
            let rs = result.resultSet
            // console.log(rs);
            // RETURN RESULT SET AS USER'S REQUIREMENT
            var data = flag > 0 ? await rs.getRows() : await rs.getRow(); // 0-> Single DataSet; 1-> Multiple DataSet
            // console.log(await rs.getRows());
            // END
            // CLOSE CONNECTION
            await con.close();
            await pool.close();
            // END
            data = flag > 0 ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' }) : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
            resolve(data);
        })
    }
     if(fname == 1){
        var fields = '*',
        table_name = 'td_pay_slip',
        where = null,
        order = null,
        flag = 1;
            var data = await D_Select(fields, table_name, where, order, flag)
     }else{

        var fields = '*',
        table_name = 'TM_DEPOSIT',
        where = null,
        order = null,
        flag = 1;
        var data = await F_Select(fields, table_name, where, order, flag)

     }
   
       
       
        res.send(data)
    //res.send(result).status(200)
})

app.get('/get_salary', async (req, res) => {
    var fields = '*',
        table_name = 'TM_DEPOSIT',
        where = null,
        order = null,
        flag = 1;
    var data = await F_Select(fields, table_name, where, order, flag)
    res.send(data)
})

// Handle post request. Use POSTMAN to initiate this method //
// app.post('/post_salary', async (req, res) => {
//     // ex: {fname: "Subham", lname: "Samanta"}
//     var data = req.body,
//         res_dt = { suc: 0, msg: 'result' };
//     var pax_id = 6;
//     // console.log(data);
//     for (let dt of data) {
//         // console.log(dt);
//         let values = ''
//         let fields = `trans_date, trans_no, sal_month, sal_year, emp_code, catg_id, basic_bal, sp, da, hra, ta, ma, arrear, 
//             ot, lwp, final_gross, income_tax, cpf, gpf, gigs, lpf, 
//             fa, gi, top, eccs, hblp, hbli, s_adv, tot_diduction, net_sal, bank_ac_no, created_by, created_dt, remarks`
//         let val = "(:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15, :16, :17, :18, :19, :20, :21, :22, :23, :24, :25, :26, :27, :28, :29, :30, :31, :32, :33)"
//         values = [dateformat(dt.trans_date, "dd-mmm-yy"), dt.trans_no, dt.sal_month, dt.sal_year, dt.emp_code, dt.catg_id, dt.basic, dt.sp, dt.da, dt.hra, dt.ta, dt.ma, dt.arrear, dt.ot, dt.lwp, dt.final_gross, dt.it, dt.cpf, dt.gpf, dt.gigs, dt.lpf, dt.fa, dt.gi, dt.top, dt.eccs, dt.hblp, dt.hbli, dt.s_adv, dt.tot_diduction, dt.net_sal, dt.bank_ac_no, dt.created_by, dt.created_dt, dt.remarks]
//         let where = null
//         let flag = 0
//         let table_name = 'TD_PAY_SLIP'
//         let dt_res = await F_Insert_bm_ardb(pax_id, table_name, fields, val, values, where, flag)
//         if (dt_res.suc == 0) {
//             res_dt = dt_res;
//             break;
//         } else {
//             res_dt = dt_res
//         }
//     }
//     // var dt = await F_Insert(pax_id, table_name, fields, values, where, flag)
//     res.send(res_dt)
// })

app.listen(port, (err) => {
    if(err) console.log(err);
    else console.log(`APP IS RUNNING AT http://localhost:${port}`);
})