const express = require('express'),
    http = require('http'),
    app = express(),
    port = process.env.PORT || 3002
session = require('express-session'),
    cors = require('cors'),
    dateFormat = require('dateformat');

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(cors());
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
const { RunProcedure } = require('./controller');

var mdbString = {
    user: 'eccsportal',
    password: 'eccsportal51101',
    connectionString: '202.21.38.94:1521/XE',
    poolMax: 10,
    poolMin: 10,
    poolIncrement: 0
}

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


app.get('/dashboard', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/test_fetch_data', async (req, res) => {
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
    };


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
app.get('/get_result_procedure', async (req, res) => {
    //  res.json(req.session.dbString)
    // For test

    var fields = '*', table_name = 'md_eccs', where = null,
        order = null;
    var data = await F_Select(mdbString, fields, table_name, where, order, 1);
    var newdta = data.msg;
    var society = JSON.stringify(newdta);
    let object = JSON.parse(society);
    //  var dbString = {
    //     i: {
    //         user: society.user_id,
    //         password: society.user_pwd,
    //         connectionString: society.conn_str,
    //         poolMax: 10,
    //         poolMin: 10,
    //         poolIncrement: 0
    //     },
    // };
    //    
    // END
    // SQL QUERY
    //    try{
    //         //console.log("Data is :",object)
    //    }catch(error){
    //     console.log(error);
    //    }
    for (socd of object) {
        console.log("Data is :", socd.ECS_CODE)
    }
    res.send(object)
})
// Handle post request. Use POSTMAN to initiate this method //
app.post('/user', async (req, res) => {
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
    res.send(dbString)
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
//    ***   API for getting list of society       //
app.get('/get_soc_list', async (req, res) => {

    var flag = 1;
    var result = await F_Select(mdbString, 'ECS_CODE,ECS_NAME', 'md_eccs', null, null, flag);
    res.send(result).status(200)
})

//    ***   API for getting Society Detail   //
app.get('/soc_detail/:soc_id', async (req, res) => {

    var soc_id = req.params.soc_id
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    res.send(result).status(200)
})

//    ***   API for getting list of society       //
app.post('/auth', async (req, res) => {
    //  const user = req.body.user;
    console.log(req.body);
    var user = req.body.user,
        pass = req.body.pass;
    var where = `USER_ID = '${user}' and USER_PWD = '${pass}'`;
    var flag = 0;
    var result = await F_Select(mdbString, '*', 'md_user', where, null, flag);
    res.send(result).status(200)
})

//    ***   API Start for getting Cash Book Report of society       //
app.post('/cash_book_rep', async (req, res) => {

    var soc_id = req.body.soc_id,
        acc_num = 21101,
        fr_dt = req.body.fr_dt,
        to_dt = req.body.to_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }
    /*var select_query = `SELECT 1 srl,dr_acc_cd,dr_particulars,0 cr_amt,0 cr_amt_tr,dr_amt,dr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE dr_acc_cd = ${acc_num}
    UNION
    SELECT 2 srl,dr_acc_cd,dr_particulars,0 cr_amt,0 cr_amt_tr,dr_amt,dr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE dr_acc_cd <> ${acc_num}
    UNION
    SELECT 3 srl,cr_acc_cd,cr_particulars,cr_amt,cr_amt_tr,0 dr_amt,0 dr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE CR_ACC_CD <> ${acc_num}
    UNION
    SELECT 4 srl,cr_acc_cd,cr_particulars,cr_amt,cr_amt_tr,0 dr_amt,0 dr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE CR_ACC_CD = ${acc_num}
    ORDER BY srl`;*/

    var select_query = `SELECT 1 srl,dr_particulars,dr_amt,dr_amt_tr,''cr_particulars,0 cr_amt,0 cr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE dr_particulars = 'To Opening Balance'
    UNION
    SELECT 2 srl,dr_particulars,dr_amt,dr_amt_tr,cr_particulars,cr_amt,cr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE dr_particulars <> 'To Opening Balance'
    and   cr_particulars <> 'By Closing Balance'
    UNION
    SELECT 3 srl,''dr_particulars,0 dr_amt,0 dr_amt_tr,cr_particulars,cr_amt,cr_amt_tr
    FROM TT_CASH_ACCOUNT
    WHERE cr_particulars = 'By Closing Balance'`;

    var sum_query = `SELECT sum(dr_amt)tot_dr_amt,
                               sum(dr_amt_tr)tot_dr_trf,
                               sum(cr_amt)tot_cr_amt,
                               sum(cr_amt_tr)tot_cr_trf
                    WHERE dr_particulars <> 'To Opening Balance'
                    and   cr_particulars <> 'By Closing Balance'`;

    pro_query = `DECLARE AD_CASH_ACC_CD NUMBER; ADT_FROM_DT DATE; ADT_TO_DT DATE; BEGIN AD_CASH_ACC_CD := ${acc_num}; ADT_FROM_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); ADT_TO_DT := TO_DATE('${to_dt}', 'dd/mm/yyyy'); P_CASH_BOOK_REP(AD_CASH_ACC_CD => AD_CASH_ACC_CD,ADT_FROM_DT => ADT_FROM_DT,ADT_TO_DT => ADT_TO_DT); END;`;
    var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, select_query)

    var select = `sum(dr_amt)tot_dr_amt,
    sum(dr_amt_tr)tot_dr_trf,
    sum(cr_amt)tot_cr_amt,
    sum(cr_amt_tr)tot_cr_trf`,
        where = `dr_particulars <> 'To Opening Balance'`,
        table_name = 'TT_CASH_ACCOUNT',
        flag = 1,
        order = null;
    var result = await F_Select(dbString, select, table_name, where, order, flag);
    listdata.length > 0 ? listdata['total_result'] = result.suc > 0 ? result.msg[0] : null : null
    res.send(listdata).status(200)
})
//    ***   API END for getting Cash Book Report of society       //

app.post('/ac_type_list', async (req, res) => {
    var soc_id = req.body.soc_id
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }
    var select = `ACC_TYPE_CD, ACC_TYPE_DESC`,
        where = `DEP_LOAN_FLAG ='L'`,
        table_name = 'MM_ACC_TYPE',
        flag = 1,
        order = null;
    var result = await F_Select(dbString, select, table_name, where, order, flag);
    res.send(result).status(200)
})

//    ***   API Start for getting loan detail list Report of society       //
app.post('/loan_detail_list', async (req, res) => {

    var soc_id = req.body.soc_id, acc_type = req.body.acc_type, fr_dt = req.body.fr_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    pro_query = `DECLARE AD_ACC_CD NUMBER; ADT_DT DATE; BEGIN AD_ACC_CD := ${acc_type}; ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); P_DETAILED_LIST_LOAN(AD_ACC_CD => AD_ACC_CD,ADT_DT => ADT_DT); END;`;
    var listdata = await RunProcedure(dbString, pro_query, 'TT_DETAILED_LIST_LOAN', '*', null, null)
    res.send(listdata).status(200)
})

//    ***   API Start for Loan Disbursement & Recovery Register        //
app.post('/loan_disb_recovery_register_rep', async (req, res) => {

    var soc_id = req.body.soc_id, 
    acc_type = req.body.acc_type, 
    fr_dt = req.body.fr_dt, 
    to_dt = req.body.to_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    pro_query = `DECLARE ADT_FROM_DT DATE; ADT_TO_DATE DATE; AS_TYPE VARCHAR2(200); BEGIN ADT_FROM_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); ADT_TO_DATE := TO_DATE('${to_dt}', 'dd/mm/yyyy');
    AS_TYPE := '${acc_type}'; P_LOAN_REGISTER( ADT_FROM_DT => ADT_FROM_DT,ADT_TO_DATE => ADT_TO_DATE,AS_TYPE => AS_TYPE); END;`
    // console.log(pro_query);
    if(acc_type == 'B'){
        select_query=`SELECT a.member_id,a.loan_id,a.memb_name,a.acc_cd,b.acc_type_desc,a.trans_dt,
                             a.prn_amt,a.gf_amt,a.share_amt
                      FROM   tt_loan_register a,MM_ACC_TYPE b
                      WHERE  a.acc_cd = b.ACC_TYPE_CD
                      AND    a.trans_type = 'B'
                      ORDER BY a.trans_dt,a.member_id,a.loan_id`
    }else{
        select_query = `SELECT a.member_id,a.loan_id,a.memb_name,a.acc_cd,b.acc_type_desc,a.trans_dt,
                                a.prn_amt,a.intt_amt
                        FROM   tt_loan_register a,MM_ACC_TYPE b
                        WHERE  a.acc_cd = b.ACC_TYPE_CD
                        AND    a.trans_type = 'R'
                        ORDER BY a.trans_dt,a.member_id,a.loan_id`
    }

    /*var listdata = await RunProcedure(dbString, pro_query, 'tt_loan_register', '*', null, null)*/
    var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, select_query)

    res.send(listdata).status(200)
})


//    ***   API Start for getting Member's Networth Statement       //
app.post('/networth', async (req, res) => {

    var soc_id = req.body.soc_id, 
        member_id = req.body.mem_id, 
        fr_dt = req.body.fr_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    var select_query = `SELECT a.acc_type_cd,c.acc_type_desc,a.CUST_CD,a.acc_num,b.cust_name,a.prn_amt,a.intt_amt
    FROM   TT_NETWORTH a,MM_CUSTOMER b,MM_ACC_TYPE c
    WHERE  a.CUST_CD = b.CUST_CD
    AND    a.ACC_TYPE_CD = c.ACC_TYPE_CD
    ORDER BY a.acc_type_cd`;


    pro_query = `DECLARE AD_MEMB_ID NUMBER; ADT_DT DATE; BEGIN AD_MEMB_ID := ${member_id}; ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy');  P_NETWORTH(AD_MEMB_ID => AD_MEMB_ID,ADT_DT => ADT_DT); END;`;

    //console.log(pro_query)
    
    var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, select_query)
    /*var listdata = await RunProcedure(dbString, pro_query, 'TT_NETWORTH', '*', null, null)*/

    var sum_query = `(sum(dep_prn) - sum(loan_prn)) networth`,
    table_name = `(
                        SELECT sum(prn_amt)dep_prn,0 loan_prn
                        FROM   TT_NETWORTH
                        WHERE  DEP_LOAN_FLAG = 'D'
                        Union
                        SELECT 0 dep_prn,sum(prn_amt)loan_prn
                        FROM   TT_NETWORTH
                        WHERE  DEP_LOAN_FLAG = 'L'
                    )`;
    
    var result = await F_Select(dbString, sum_query, table_name, null, null, 0);
    listdata.length > 0 ? listdata[listdata.length- 1] = result.suc > 0 ? result.msg : null : null;
    res.send(listdata).status(200)
    
})

//API for deposit acc type
app.post('/ac_type_list_deposit', async (req, res) => {
    var soc_id = req.body.soc_id
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }
    var select = `ACC_TYPE_CD, ACC_TYPE_DESC`,
        where = `DEP_LOAN_FLAG ='D' AND ACC_TYPE_CD IN(1,8,9,10,12)`,
        table_name = 'MM_ACC_TYPE',
        flag = 1,
        order = null;
    var result = await F_Select(dbString, select, table_name, where, order, flag);
    res.send(result).status(200)
})

//    ***   API Start for All Deposit Detail List       //
app.post('/all_deposit_detail_list', async (req, res) => {

    var soc_id = req.body.soc_id, acc_type = req.body.acc_type, fr_dt = req.body.fr_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    pro_query = `DECLARE ACCTYPECD NUMBER; ADT_DT DATE; BEGIN ACCTYPECD := ${acc_type}; ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); P_SBCA_DETAILED_LIST(ACCTYPECD => ACCTYPECD,ADT_DT => ADT_DT);END;`;
    var listdata = await RunProcedure(dbString, pro_query, 'tt_sbca_dtl_list', '*', null, null)
    res.send(listdata).status(200)
})

//    ***   API Start for Recuring Deposit intt Detail List     //
app.post('/all_rd_prov_intt_detail_list', async (req, res) => {

    var soc_id = req.body.soc_id, fr_dt = req.body.fr_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    pro_query = `DECLARE ADT_DT DATE; BEGIN  ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); P_RD_PROV_INTT_DETAIL_LIST(ADT_DT => ADT_DT);END`;
    var listdata = await RunProcedure(dbString, pro_query, 'tt_rdprov_intt', '*', null, null)
    res.send(listdata).status(200)
})
//    ***   API END for Recuring Deposit intt Detail List     //


//    ***   API Start for Fixed Deposit intt Detail List     //
app.post('/all_fixed_prov_intt_detail_list', async (req, res) => {

    var soc_id = req.body.soc_id, fr_dt = req.body.fr_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    pro_query = `DECLARE ADT_DT DATE; BEGIN  ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); P_TD_PROV_INTT_DETAIL_LIST(ADT_DT => ADT_DT);END`;
    var listdata = await RunProcedure(dbString, pro_query, 'tt_tdprov_intt', '*', null, null)
    res.send(listdata).status(200)
})
//    ***   API END for Recuring Deposit intt Detail List     //
//    ***   API Start for open_close_register List     //
app.post('/open_close_register_list', async (req, res) => { 

    var soc_id = req.body.soc_id, 
        acc_status = req.body.acc_status, 
        fr_dt = req.body.fr_dt, 
        to_dt = req.body.to_dt, select_query;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    pro_query = `DECLARE ADT_FROM_DT DATE;ADT_TO_DT DATE;AS_ACC_STATUS VARCHAR2(200); BEGIN  ADT_FROM_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy');ADT_TO_DT := TO_DATE('${to_dt}', 'dd/mm/yyyy');AS_ACC_STATUS := '${acc_status}'; P_OPEN_CLOSE_REGISTER(ADT_FROM_DT => ADT_FROM_DT,
            ADT_TO_DT => ADT_TO_DT,AS_ACC_STATUS => AS_ACC_STATUS);END;`;

    if(acc_status == 'C'){
        select_query=`SELECT a.acc_type_cd,c.acc_type_desc,a.acc_num,b.cust_name,a.opening_dt closing_dt,a.opening_prn
        FROM   TT_OPEN_CLOSE_REGISTER a,MM_CUSTOMER b,MM_ACC_TYPE c
        WHERE  a.CUST_CD = b.CUST_CD
        AND    a.ACC_TYPE_CD = c.ACC_TYPE_CD
        AND    a.ACC_STATUS = 'C'
        AND    a.ACC_TYPE_CD <> 12
        ORDER BY a.acc_type_cd,a.cust_cd`
    }else{
        select_query = `SELECT a.acc_type_cd,c.acc_type_desc,a.acc_num,b.cust_name,a.opening_dt,a.opening_prn
        FROM   TT_OPEN_CLOSE_REGISTER a,MM_CUSTOMER b,MM_ACC_TYPE c
        WHERE  a.CUST_CD = b.CUST_CD
        AND    a.ACC_TYPE_CD = c.ACC_TYPE_CD
        AND    a.ACC_STATUS = 'O'
        AND    a.ACC_TYPE_CD <> 12
        ORDER BY a.acc_type_cd,a.cust_cd`
    }

    var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, select_query)
    res.send(listdata).status(200)
})
//    ***   API END for open_close_register List     //

//    ***   API Start for Balance scroll List     //
app.post('/p_balance_scroll_list', async (req, res) => {

    var soc_id = req.body.soc_id, fr_dt = req.body.fr_dt;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    var bs_query = `
    SELECT 1 srl_no,decode(a.ACC_TYPE,'1','Liability','2','Asset') acc_type,a.sch_cd sch_cd,
           b.schedule_desc schedule_desc,a.acc_cd acc_cd,
           a.acc_name acc_name,a.open_bal open_bal_act,
           abs(a.open_bal)opn_bal,decode(abs(a.open_bal) + a.open_bal,0,'Cr','Dr')opn_dr_cr_flag,
           a.CR_AMT cr_amt,a.DR_AMT dr_amt,
           a.close_bal close_bal_act,abs(a.close_bal)cls_bal,
           decode(abs(a.close_bal) + a.close_bal,0,'Cr','Dr')cls_dr_cr_flag
    FROM TT_BALANCE_SHEET a,M_SCHEDULE_MASTER b
    WHERE a.SCH_CD = b.schedule_cd
    AND   a.ACC_TYPE  = 1
    UNION
    SELECT 2 srl_no,''acc_type,0 sch_cd,
           ''schedule_desc,0 acc_cd,
           'Total of Liability'acc_name,sum(open_bal)open_bal_act,abs(sum(open_bal))opn_bal,
           decode(abs(sum(open_bal)) + sum(open_bal),0,'Cr','Dr')opn_dr_cr_flag,
           sum(CR_AMT)cr_amt,sum(DR_AMT)dr_amt,
           sum(close_bal)close_bal_act,abs(sum(close_bal))cls_bal,
           decode(abs(sum(close_bal)) + sum(close_bal),0,'Cr','Dr')cls_dr_cr_flag
    FROM TT_BALANCE_SHEET  
    WHERE ACC_TYPE = 1 
    UNION
    SELECT 3 srl_no,decode(a.ACC_TYPE,'1','Liability','2','Asset')acc_type,a.sch_cd sch_cd,
           b.schedule_desc schedule_desc,a.acc_cd acc_cd,
           a.acc_name acc_name,a.open_bal open_bal_act,
           abs(a.open_bal)opn_bal,decode(abs(a.open_bal) + a.open_bal,0,'Cr','Dr')opn_dr_cr_flag,
           a.CR_AMT cr_amt,a.DR_AMT dr_amt,
           a.close_bal close_bal_act,abs(a.close_bal)cls_bal,
           decode(abs(a.close_bal) + a.close_bal,0,'Cr','Dr')cls_dr_cr_flag
    FROM TT_BALANCE_SHEET a,M_SCHEDULE_MASTER b
    WHERE a.SCH_CD = b.schedule_cd
    AND   a.ACC_TYPE  = 2
    UNION
    SELECT 4 srl_no,''acc_type,0 sch_cd,
           ''schedule_desc,0 acc_cd,
           'Total of Asset'acc_name,sum(open_bal)open_bal_act,abs(sum(open_bal))opn_bal,
           decode(abs(sum(open_bal)) + sum(open_bal),0,'Cr','Dr')opn_dr_cr_flag,
           sum(CR_AMT)cr_amt,sum(DR_AMT)dr_amt,
           sum(close_bal)close_bal_act,abs(sum(close_bal))cls_bal,
           decode(abs(sum(close_bal)) + sum(close_bal),0,'Cr','Dr')cls_dr_cr_flag
    FROM TT_BALANCE_SHEET  
    WHERE ACC_TYPE = 2 
    ORDER BY srl_no`;

    pro_query = `DECLARE ADT_DT DATE; BEGIN  ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); P_BLANCE_SCROLL(ADT_DT => ADT_DT);END;`;
    /*var listdata = await RunProcedure(dbString, pro_query, 'tt_balance_sheet', '*', null, null)*/
    var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, bs_query)
    res.send(listdata).status(200)
})
//    ***   API END for Balance scroll List     //

//    ***   API Start for P/L Account  List     //
app.post('/p_pl_scroll_list', async (req, res) => {

    var soc_id = req.body.soc_id, fr_dt = req.body.date;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    var ps_query = `SELECT a.SL_NO,  
                    a.CR_ACC_CD, 
                    b.ACC_NAME,  
                    a.CR_AMOUNT,  
                    a.DR_ACC_CD,
                    c.ACC_NAME,  
                    a.DR_AMOUNT,  
                    a.SCH_CD,  
                    a.SCH_CD_CR  
                FROM tt_pl_book a,m_acc_master b,m_acc_master c
                WHERE a.CR_ACC_CD = b.ACC_CD 
                AND   a.DR_ACC_CD = c.ACC_CD`;

    var pro_query = `DECLARE ADT_DT DATE; BEGIN  ADT_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); P_PL_SCROLL(ADT_DT => ADT_DT);END;`;

    var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, ps_query)
    res.send(listdata).status(200)
})
//    ***   API END for P/L Account  List     //

//    ***   API Start for Trial Balance       //
app.post('/trial', async (req, res) => {

    var soc_id = req.body.soc_id,
        acc_type = req.body.acc_type,
        fr_dt = req.body.fr_dt
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }
    
    var trial_query = `SELECT tm_acc_balance.balance_dt,tm_acc_balance.acc_cd,
                               m_acc_master.schedule_cd,m_acc_master.acc_name,  
                               Decode(tm_acc_balance.balance_amt + ABS(tm_acc_balance.balance_amt), 0, 0,
                               tm_acc_balance.balance_amt) Debit,Decode(tm_acc_balance.balance_amt + ABS(tm_acc_balance.balance_amt), 0,
                               ABS(tm_acc_balance.balance_amt), 0) Credit, Substr(m_acc_master.acc_cd,1,1) acc_type    
                        FROM   tm_acc_balance, m_acc_master  
                        WHERE  tm_acc_balance.acc_cd = m_acc_master.acc_cd  
                        AND tm_acc_balance.balance_dt = (SELECT max(balance_dt)
                                                         FROM   tm_acc_balance
                                                         WHERE  balance_dt <= to_date('${fr_dt}','dd/mm/yyyy'))
                        AND tm_acc_balance.balance_amt <> 0  
                        AND substr(tm_acc_balance.acc_cd,1,1) = ${acc_type}
                        AND tm_acc_balance.acc_cd <> 13201
                        ORDER BY acc_type,schedule_cd,acc_cd`;

    /* = `DECLARE AD_CASH_ACC_CD NUMBER; ADT_FROM_DT DATE; ADT_TO_DT DATE; BEGIN AD_CASH_ACC_CD := ${acc_num}; ADT_FROM_DT := TO_DATE('${fr_dt}', 'dd/mm/yyyy'); ADT_TO_DT := TO_DATE('${to_dt}', 'dd/mm/yyyy'); P_CASH_BOOK_REP(AD_CASH_ACC_CD => AD_CASH_ACC_CD,ADT_FROM_DT => ADT_FROM_DT,ADT_TO_DT => ADT_TO_DT); END;`;*/
    
    // var listdata = await RunProcedure(dbString, pro_query, null, null, null, null, 1, trial_query)

    var result = await F_Select(dbString, null, null, null, null, 1, trial_query);

    // listdata.length > 0 ? listdata['total_result'] = result.suc > 0 ? result.msg[0] : null : null

    res.send(result).status(200)
})

//    ***   API Start for member List     //
app.post('/member_list', async (req, res) => {

    var soc_id = req.body.soc_id,
        date = req.body.date;
    var flag = 0;
    var where = `ECS_CODE = ${soc_id}`;
    var result = await F_Select(mdbString, '*', 'md_eccs', where, null, flag);
    var newdta = result.msg;

    var dbString = {
        user: newdta.USER_ID,
        password: newdta.USER_PWD,
        connectionString: newdta.CONN_SRT,
        poolMax: 10,
        poolMin: 10,
        poolIncrement: 0
    }

    var flag2 = 1;
    var select = `"MM_MEMBER"."MEMBER_ID",        
    "MM_UNIT"."UNIT_NAME",        
    "MM_MEMBER"."MEMBER_NAME",      
    "MM_MEMBER"."GUARDIAN_NAME",        
    "MM_MEMBER"."ADDRESS",      
    "MM_MEMBER"."PHONE_NO",      
    "MM_MEMBER"."SEX",      
    "MM_MEMBER"."D_O_BIRTH",    
    "MM_MEMBER"."EMP_CODE",      
    "MM_MEMBER"."DT_JOIN",      
    "MM_MEMBER"."PRESENT_ADDR",  
    "MM_MEMBER"."THRIFT_CONTRIBUTION",      
    "MM_MEMBER"."MOBILE_NO",    
    "MM_MEMBER"."DT_RET",        
    "MM_MEMBER"."SB_NO",  
    "MM_MEMBER"."MEMBER_STATUS",
    "MM_MEMBER"."VB_EMP_NO"`,
        table_name = `"MM_MEMBER", "MM_UNIT", "TM_DEPOSIT"`,
        where = `"MM_MEMBER"."EMP_CODE" = "TM_DEPOSIT"."ACC_NUM"
AND      "MM_MEMBER"."UNIT_CD"  = "MM_UNIT"."UNIT_CD"
AND      "TM_DEPOSIT"."ACC_TYPE_CD" = 8
AND      "MM_MEMBER"."APPROVAL_STATUS" = 'A'    
AND      "TM_DEPOSIT"."OPENING_DT"  <= TO_DATE('${date}', 'dd/mm/yyyy')
And      TO_DATE('${date}', 'dd/mm/yyyy')  < decode(nvl(to_date("TM_DEPOSIT"."ACC_CLOSE_DT", 'dd/mm/yyyy'), to_date('31/12/2500','dd/mm/yyyy')), to_date('31/12/2500','dd/mm/yyyy'),to_date('31/12/2500','dd/mm/yyyy'), "TM_DEPOSIT"."ACC_CLOSE_DT")`,
        order = `ORDER BY "MM_MEMBER"."MEMBER_ID"`,
        flag = 1;
    var listdata = await F_Select(dbString, select, table_name, where, order, flag);
    res.send(listdata).status(200)
})
//    ***   API END for member  List     //



app.listen(port, (err) => {
    if (err) console.log(err);
    else console.log(`APP IS RUNNING AT 202.21.38.94:${port}`);
})