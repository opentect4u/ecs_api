// VARIABLE & MODULE INITIALIZATION
const oracledb = require('oracledb'),
    // instantclient = require('instantclient'),
    path = require('path');
    console.log(path.join(__dirname, 'instantclient'));
try {
    oracledb.initOracleClient({libDir: 'C:\\instaclient\\instantclient_11_2'});
} catch (err) {
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
}
//oracledb.initOracleClient({ libDir: 'C:\\instantclient\\instantclient_18_5' });
oracledb.autoCommit = true;
// END

// var dbString = {
//     user: 'ddccbeccs',
//     password: 'ddccbeccs41101',
//     connectionString: 'synergic-db1.ckoqkwog5p58.ap-south-1.rds.amazonaws.com:1521/syndb1',
//     poolMax: 10,
//     poolMin: 10,
//     poolIncrement: 0
// }

// FUNCTION FOR EXICUTE SELECT QUERY AND RETURN RESULT
const F_Select = (dbString, fields, table_name, where, order, flag, full_query = null) => {
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

       try {
             // EXICUTE QUERY
            const result = await con.execute(full_query ? full_query : sql, [], {
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
            // CLOSE CONNECTION
            await con.close();
            await pool.close();
            // END
            data = flag > 0 ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' }) : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
            resolve(data);
            // END
       }catch (err){
            console.log(err);
            await con.close();
            await pool.close();
            resolve({suc:0, msg:err});
       }
       
    })
}

const F_run_procedure = (dbString) => {
    return new Promise(async (resolve, reject) => {
        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(dbString);
        const con = await pool.getConnection();
        // END
     //   let sql = procedure_query

     result = con.execute(
            "BEGIN p_cash_book_rep(:id, :fr_dt, :to_dt); END;",
            {  // bind variables
              id:   159,
              fr_dt: '27/06/2023',
              to_dt: '27/07/2023',
            },
            function (err, result) {
              if (err) { console.error(err.message); return; }
              console.log(result.outBinds);
            });
        // EXICUTE QUERY
        // const result = await con.execute(sql, ['11102','27/07/2023','27/07/2023'], {
        //     resultSet: true,
        //     outFormat: oracledb.OUT_FORMAT_OBJECT
        
        // });
        // END

        // STORE RESULT SET IN A VARIABLE
       // let rs = result.resultSet

        // RETURN RESULT SET AS USER'S REQUIREMENT
      //  var data = await rs.getRows() ; // 0-> Single DataSet; 1-> Multiple DataSet
        // console.log(await rs.getRows());
        // END
        // CLOSE CONNECTION
        await con.close();
        await pool.close();
        // END
	//	data = flag > 0 ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' }) : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
        resolve(result);
    })
}

const F_Insert = (dbString,table_name, fields, val, values, where, flag) => {
    return new Promise(async (resolve, reject) => {
        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(dbString);
        const con = await pool.getConnection();
        // END

        // SQL QUERY
        const sql = flag > 0 ? `UPDATE "${table_name}" SET ${fields} WHERE ${where}` :
            `INSERT INTO "${table_name}" (${fields}) VALUES (${val})`; // 0-> INSERT NEW DATA; 1-> UPDATE TABLE DATA
        // console.log(sql);

        try {
            // EXICUTE QUERY AND RETURN RESULT
            if (await con.execute(sql, values, { autoCommit: true })) {
                res_data = { suc: 1, msg: 'success' }
            } else {
                res_data = { suc: 0, msg: 'err' }
            }
            await con.close();
            await pool.close();
            // const res = await con.execute(`SELECT * FROM "${table_name}"`);
            resolve(res_data)
        } catch (err) {
            console.log(err);
            await con.close();
            await pool.close();
            resolve({ suc: 0, msg: err })
        }
        //END
    })
}

const RunProcedure = (conString, pro_query, table_name, fields, where, order, flag=null, full_query=null) => {
    return new Promise(async (resolve, reject) => {
        where = where ? `WHERE ${where}` : '';
        order = order ? order : '';
  
        const pool = await oracledb.createPool(conString);
        const con = await pool.getConnection();
    //pro_query = "";
        let query = pro_query;//`DECLARE AD_ACC_TYPE_CD NUMBER; AS_ACC_NUM VARCHAR2(200); ADT_FROM_DT DATE; ADT_TO_DT DATE; BEGIN AD_ACC_TYPE_CD := 6; AS_ACC_NUM := '1044100002338'; ADT_FROM_DT := to_date(to_char('20-Oct-2021')); ADT_TO_DT := to_date(to_char('20-Oct-2022')); P_ACC_STMT( AD_ACC_TYPE_CD => AD_ACC_TYPE_CD, AS_ACC_NUM => AS_ACC_NUM, ADT_FROM_DT => ADT_FROM_DT, ADT_TO_DT => ADT_TO_DT ); END;`;
        try{
            console.log(query);
            await con.execute(query);
            const r = await con.execute(flag > 0 ? full_query : `SELECT ${fields} FROM ${table_name} ${where} ${order}`, [], {
                resultSet: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            let rs = r.resultSet
        //   console.log({rs});
            var data = await rs.getRows();
  
        //   console.log({data});
            await con.close();
            await pool.close();
            resolve(data);
        } catch (err){
            console.log(err);
            await con.close();
            await pool.close();
            resolve(err);
        }
    })
}

const F_Delete = (pax_id, table_name, where) => {
    return new Promise(async (resolve, reject) => {
        // CREATE DB CONNECTION
        const pool = await oracledb.createPool(db_details[pax_id]);
        const con = await pool.getConnection();
        // END

        try{
            // SQL QUERY
            const sql = `DELETE FROM ${table_name} WHERE ${where}`;
            console.log(sql);

            const result = await con.execute(sql, [], {
                resultSet: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            // END
            console.log(result);
            // STORE RESULT SET IN A VARIABLE
            let rs = result.rowsAffected
            // console.log(rs);
    
            // CLOSE CONNECTION
            // await con.release();
            await con.close();
            await pool.close();
            // END
            data = rs > 0 ? { suc: 1, msg: 'Deleted Successfully' } : { suc: 0, msg: 'Error in deletion' }
            resolve(data);
            //END
        }catch(err){
            await con.close();
            await pool.close();
            resolve(err);
        }
    })
}

module.exports = {F_Select, F_Insert,F_run_procedure, RunProcedure, F_Delete}