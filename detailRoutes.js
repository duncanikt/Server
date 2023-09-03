// 敏感前端訊息隱藏
const dotenv = require('dotenv');
dotenv.config({ path: 'BackEnd.env' }); // 指定 BackEnd.env 檔案的路徑
const MongoDB_URL = process.env.MongoDB_URL;
const corsOptions_origin = process.env.corsOptions_origin.split(',');
// 敏感後端訊息隱藏
const DetailDataData= process.env.DetailDataData;
const DetailUp= process.env.DetailUp;
const DetailDel= process.env.DetailDel;
const DetailMax= process.env.DetailMax;
const DetailIns= process.env.DetailIns;

const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

// MongoDB連接URL
const url = MongoDB_URL; // 或者你的MongoDB連接URL
const dbName = 'hello'; // 資料庫名稱
const collectionName = 'aABC'; // 集合名稱

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const cors = require('cors');
// 在其他中介軟體之前使用 cors 中介軟體
// app.use(cors({ origin: 'http://3.106.x.x' }));
router.use(cors({ origin: corsOptions_origin }));

router.get(DetailDataData, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const searchInput = req.query.search;

  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.error('Failed to connect to MongoDB:', err);
      res.status(500).send('Failed to connect to MongoDB');
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let query = {};
    if (searchInput) {
      query.ABC = { $regex: searchInput };
    }

    collection.find(query).toArray(function(err, docs) {
      if (err) {
        console.error('Failed to query data:', err);
        res.status(500).send('Failed to query data');
        return;
      }

      const filteredDocs = docs.map(doc => {
        const detailPostureArray = doc.DetailPosture || []; // 處理DetailPosture欄位不存在的情況
        return {
          ABC: doc.ABC,
          DetailPosture: detailPostureArray
        };
      });
      res.json(filteredDocs);

      client.close();
    });
  });
});



const bodyParser = require('body-parser');
router.use(bodyParser.json());

// 更新資料
router.post(DetailUp, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const data = req.body;
  const ABC = data.ABC;
  const height = data.height;
  const weight = data.weight;
  const ShoulderWidth = data.ShoulderWidth;

  MongoClient.connect(url)
    .then(client => {
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // 構建 MongoDB 查詢準則
      const query = { ABC: ABC };

      // 查找匹配的文檔
      collection.findOne(query)
        .then(doc => {
          if (doc) {
            const detailPostureArray = doc.DetailPosture || []; // 處理DetailPosture欄位不存在的情況
            let updated = false;

            // 遍歷DetailPosture陣列中的每個物件
            const updatedDetailPostureArray = detailPostureArray.map(detailPosture => {
              if (detailPosture.ShoulderWidth === ShoulderWidth) {
                // 匹配成功，更新height和weight欄位
                detailPosture.height = height;
                detailPosture.weight = weight;
                updated = true;
              }
              return detailPosture;
            });

            if (updated) {
              // 更新文檔中的DetailPosture欄位
              const updateQuery = { ABC: ABC };
              const updateValues = {
                $set: {
                  DetailPosture: updatedDetailPostureArray
                }
              };

              collection.updateOne(updateQuery, updateValues)
                .then(result => {
                  res.sendStatus(200);
                  client.close();
                })
                .catch(error => {
                  console.log('Update failed:', error);
                  res.sendStatus(500);
                });
            } else {
              res.sendStatus(404); // 沒有找到匹配的資料
            }
          } else {
            res.sendStatus(404); // 沒有找到匹配的資料
          }
        })
        .catch(error => {
          console.log('Query failed:', error);
          res.sendStatus(500);
        });
    })
    .catch(error => {
      console.log('Failed to connect to MongoDB:', error);
      res.sendStatus(500);
    });
});



// DEL路由處理
router.delete(DetailDel, (req, res) => {
  const ABC = req.body.ABC;
  const ShoulderWidth = req.body.ShoulderWidth;

  // 連接到資料庫
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.error('Failed to connect to MongoDB:', err);
      res.sendStatus(500);
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 構建 MongoDB 刪除操作
    const deleteQuery = {
      ABC: ABC,
      'DetailPosture': { $elemMatch: { ShoulderWidth: ShoulderWidth } }
    };
    console.log('delete SQL碼:', JSON.stringify(deleteQuery));

    // 執行刪除操作
    collection.updateOne(deleteQuery, { $pull: { DetailPosture: { ShoulderWidth: ShoulderWidth } } }, function(err, result) {
      if (err) {
        console.log('Delete failed:', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }

      // 關閉資料庫連接
      client.close();
    });
  });
});





router.get(DetailMax, (req, res) => {
  // 連接到資料庫
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.error('Failed to connect to MongoDB:', err);
      res.status(500).send('Failed to connect to MongoDB');
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 獲取前端傳遞的單號值
    const searchInput = req.query.master;

    // 構建 MongoDB 查詢語句
    const query = { ABC: searchInput };

    // 查詢資料，並按照 DetailPosture 中的 ShoulderWidth 欄位降冪排序，取得最大值
    collection.aggregate([
      { $match: query },
      { $unwind: '$DetailPosture' },
      { $sort: { 'DetailPosture.ShoulderWidth': -1 } },
      { $limit: 1 },
      { $project: { maxValue: '$DetailPosture.ShoulderWidth' } }
    ]).toArray(function(err, docs) {
      if (err) {
        console.error('Failed to query data:', err);
        res.status(500).send('Failed to query data');
        return;
      }

      console.log('Query result:', docs);

      if (docs.length > 0) {
        const maxValue = docs[0].maxValue;
        res.json({ maxValue: maxValue });
      } else {
        res.json({ maxValue: 0 });
      }

      // 關閉資料庫連接
      client.close();
    });
  });
});



// 路由處理常式
router.post(DetailIns, (req, res) => {
  const newCol1 = req.body.newCol1;
  const newCol2 = req.body.newCol2; // 修改為DetailPosture的ShoulderWidth
  const newCol3 = req.body.newCol3; // 修改為DetailPosture的height
  const newCol4 = req.body.newCol4; // 修改為DetailPosture的weight

  MongoClient.connect(url)
    .then(client => {
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // 檢查數組中的第一個欄位是否有重複值
      const query = {
        ABC: newCol1,
        DetailPosture: { $elemMatch: { ShoulderWidth: newCol2 } }
      };
      console.log('查詢條件:', query);
      console.log('detailinsert SQL碼:', JSON.stringify(query));

      return collection.findOne(query)
        .then(existingRecord => {
          console.log('查詢結果:', existingRecord);
          if (existingRecord) {
            // 數組中的第一個欄位有重複值，返回錯誤給前端
            res.status(400).json({ error: 'ShoulderWidth already exists' });
            client.close();
          } else {
            // 數組中的第一個欄位沒有重複值，進行新增操作
            const update = {
              $push: {
                DetailPosture: {
                  ShoulderWidth: newCol2,
                  height: newCol3,
                  weight: newCol4
                }
              }
            };

            return collection.updateOne({ ABC: newCol1 }, update)
              .then(result => {
                res.sendStatus(200);
              })
              .catch(error => {
                console.log('Update failed:', error);
                res.sendStatus(500);
              })
              .finally(() => {
                client.close();
              });
          }
        })
        .catch(error => {
          console.log('FindOne failed:', error);
          res.sendStatus(500);
          client.close();
        });
    })
    .catch(error => {
      console.log('Failed to connect to MongoDB:', error);
      res.sendStatus(500);
    });
});


module.exports = router;


