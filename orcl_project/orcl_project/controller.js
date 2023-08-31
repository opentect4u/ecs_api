// VARIABLE & MODULE INITIALIZATION
const oracledb = require('oracledb'),
    // instantclient = require('instantclient'),
    path = require('path');
    console.log(path.join(__dirname, 'instantclient'));
try {
    oracledb.initOracleClient({libDir: 'D:\\oracle\\instantclient_11_2'});
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
const F_Select = (dbString, fields, table_name, where, order, flag) => {
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
            // const res = await con.execute(`SELECT * FROM "${table_name}"`);
            resolve(res_data)
        } catch (err) {
            console.log(err);
            resolve({ suc: 0, msg: err })
        }
        //END
    })
}

module.exports = {F_Select, F_Insert}