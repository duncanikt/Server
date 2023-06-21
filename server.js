const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

const connectionString = 'Data Source=.; Initial Catalog=LY_ERP; uid=sa; pwd=qazwsxedc; trustServerCertificate=true';

// 连接数据库
sql.connect(connectionString, function (err) {
  if (err) {
    console.log('Error connecting to database:', err);
    throw err;
  } else {
    console.log('Connected to database');
  }
});

// POST /update 路由处理
app.post('/update', (req, res) => {
  const ABC = req.body.ABC;
  const NameABC = req.body.NameABC;
  const NameABCTW = req.body.NameABCTW;
  const NameABCEng = req.body.NameABCEng;
  const Date = req.body.Date;

  // 执行修改数据库的 SQL 程序，使用 ABC 作为查询条件，更新其余字段的值
  const updateSql = 'UPDATE aABC SET NameABC = @NameABC, NameABCTW = @NameABCTW, NameABCEng = @NameABCEng, Date = @Date WHERE ABC = @ABC';
  
  const request = new sql.Request();
  request.input('ABC', sql.VarChar, ABC);
  request.input('NameABC', sql.VarChar, NameABC);
  request.input('NameABCTW', sql.VarChar, NameABCTW);
  request.input('NameABCEng', sql.VarChar, NameABCEng);
  request.input('Date', sql.VarChar, Date);

  request.query(updateSql, (error, result) => {
    if (error) {
      console.log('Update failed:', error);
      res.sendStatus(500);
    } else {
      console.log('Update successful');
      res.sendStatus(200);
    }
  });
});



app.get('/data', (req, res) => {
  const searchInput = req.query.search;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const request = new sql.Request();

  // 构建 SQL 查询语句
  let query = 'SELECT * FROM aABC ';
  if (searchInput) {
    query += `WHERE ABC LIKE '%${searchInput}%'`;
  } else {
    query += 'WHERE ABC IS NOT NULL ';
  }
  if (startDate) {
    query += `AND Date >= '${startDate}'`;
  }
  if (endDate) {
    query += `AND Date <= '${endDate}'`;
  }

  request.query(query, function (err, recordset) {
    if (err) {
      console.log('Error querying database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(recordset);
    }
  });
});



// app.get('/maxValue', function(req, res) {
//   var sql = 'SELECT MAX(ABC) AS maxValue FROM aABC';
//   const pool = new sql.Request();


//   pool.query(sql, function(error, result) {
//     if (error) {
//       console.log('Error:', error);
//       res.status(500).json({ error: 'An error occurred' });
//     } else {
//       var maxValue = result[0].maxValue;
//       res.json({ maxValue: maxValue });
//     }
//   });
// });

app.get('/maxValue', (req, res) => {
  const sql = require('mssql');
  const request = new sql.Request();
  // 构建 SQL 查询语句
  let query = 'SELECT MAX(ABC) AS maxValue FROM aABC';
  request.query(query, function (err, recordset) {
    if (err) {
      console.log('Error querying database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(recordset);
      // var maxValue = recordset[0].maxValue;
      // res.json({ maxValue: maxValue });
    }
  });
});




app.post('/insert', function(req, res) {
  var newCol1 = req.body.newCol1;
  var newCol2 = req.body.newCol2;
  var newCol3 = req.body.newCol3;
  var newCol4 = req.body.newCol4;
  var newCol5 = req.body.newCol5;
  const sql = require('mssql');

  const request = new sql.Request();
  request.input('newCol1', sql.VarChar, newCol1);
  request.input('newCol2', sql.VarChar, newCol2);
  request.input('newCol3', sql.VarChar, newCol3);
  request.input('newCol4', sql.VarChar, newCol4);
  request.input('newCol5', sql.VarChar, newCol5);
  
  var insertSql = "INSERT INTO aABC (ABC, NameABC, NameABCTW, NameABCEng, Date) VALUES (@newCol1, @newCol2, @newCol3, @newCol4, @newCol5)";

  request.query(insertSql, function(err, result) {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
      return;
    }
    res.sendStatus(200);
  });
});





// DELETE /delete 路由处理
app.delete('/delete', (req, res) => {
  const ABC = req.body.ABC;

  // 执行从数据库中删除数据的 SQL 程序，使用 ABC 作为查询条件
  const deleteSql = 'DELETE FROM aABC WHERE ABC = @ABC';
  
  const request = new sql.Request();
  request.input('ABC', sql.VarChar, ABC);

  request.query(deleteSql, (error, result) => {
    if (error) {
      console.log('Delete failed:', error);
      res.sendStatus(500);
    } else {
      console.log('Delete successful');
      res.sendStatus(200);
    }
  });
});




app.get('/', (req, res) => {
  res.send('Hello, world! This is my server.js code.');
});






const port = 8081;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});










