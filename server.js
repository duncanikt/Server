
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const port = process.env.PORT || 3000;

// 敏感前端訊息隱藏
const dotenv = require('dotenv');
dotenv.config({ path: 'BackEnd.env' }); // 指定 BackEnd.env 檔案的路徑
const MongoDB_URL = process.env.MongoDB_URL;
const Access_Control_Allow_Origin = process.env.Access_Control_Allow_Origin;
const corsOptions_origin = process.env.corsOptions_origin.split(',');
const secret_recaptchaV3_token = process.env.secret_recaptchaV3_token;
const secret_recaptchaV2_token = process.env.secret_recaptchaV2_token;
const passport_session_secret = process.env.passport_session_secret;
const clientID_OAuth2_0 = process.env.clientID_OAuth2_0;
const clientSecret_OAuth2_0 = process.env.clientSecret_OAuth2_0;
const callbackURL_OAuth2_0 = process.env.callbackURL_OAuth2_0;
const Token_secretKey = process.env.Token_secretKey;
// 敏感後端訊息隱藏
const Up=process.env.Up;
const Del=process.env.Del;
const Max=process.env.Max;
const Ins=process.env.Ins;
const Reg=process.env.Reg;
const LoginLogin=process.env.LoginLogin;
const DataData=process.env.DataData;
const LogoutLogout=process.env.LogoutLogout;

// MongoDB連接URL
const url = MongoDB_URL; // 或者你的MongoDB連接URL

const dbName = 'hello'; // 資料庫名稱
const collectionName = 'aABC'; // 集合名稱


// 允許來自 https://X.github.io 的請求
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", Access_Control_Allow_Origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const cors = require('cors');
// 在其他中介軟體之前使用 cors 中介軟體
// app.use(cors({ origin: 'http://3.106.x.x' }));
const corsOptions = {
  origin: corsOptions_origin,
  credentials: true, // 允許發送憑據
};

app.use(cors(corsOptions));
// 導入詳情頁面路由處理常式
const detailRoutes = require('./detailRoutes');
// res.setHeader('Access-Control-Allow-Origin', '*');
// 在主應用程式中使用詳情頁面路由處理常式
app.use('/detail', detailRoutes);
// res.setHeader('Access-Control-Allow-Origin', '*');


const bodyParser = require('body-parser');
app.use(bodyParser.json());
// 更新資料
app.post(Up, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const data = req.body;

  const ABC = data.ABC;
  const NameABC = data.NameABC;
  const NameABCTW = data.NameABCTW;
  const NameABCEng = data.NameABCEng;
  const Date = data.Date;

  MongoClient.connect(url)
    .then(client => {
      // console.log('Connected to MongoDB');

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // 構建 MongoDB 更新操作
      const updateQuery = { ABC: data.ABC };
      const updateValues = {
        $set: {
          NameABC: NameABC,
          NameABCTW: NameABCTW,
          NameABCEng: NameABCEng,
          Date: Date
        }
      };

      // 列印查詢語句
      console.log('Update query:', updateQuery);
      console.log('Update values:', updateValues);

      return collection.updateOne(updateQuery, updateValues)
        .then(result => {
          // console.log('Update successful');
          res.sendStatus(200);

          client.close();
        })
        .catch(error => {
          console.log('Update failed:', error);
          res.sendStatus(500);
        });
    })
    .catch(error => {
      console.log('Failed to connect to MongoDB:', error);
      res.sendStatus(500);
    });
});


// DELETE /delete 路由處理
app.delete(Del, (req, res) => {
  const ABC = req.body.ABC;

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
    const deleteQuery = { ABC: ABC };
    console.log('delete SQL碼:', JSON.stringify(deleteQuery));
    // 執行刪除操作
    collection.deleteOne(deleteQuery, function(err, result) {
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


app.get(Max, (req, res) => {
  const { MongoClient } = require('mongodb');
  // 連接到資料庫
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.error('Failed to connect to MongoDB:', err);
      res.status(500).send('Failed to connect to MongoDB');
      return;
    }
    const db = client.db(dbName); // 根據您的MongoDB配置填入正確的資料庫名稱
    const collection = db.collection(collectionName); // 根據您的MongoDB配置填入正確的集合名稱
    // 構建 MongoDB 查詢語句
    const query = {};
    // 查詢資料
    collection.find(query).sort({ ABC: -1 }).limit(1).toArray(function(err, docs) {
      if (err) {
        console.error('Failed to query data:', err);
        res.status(500).send('Failed to query data');
        return;
      }
      console.log('Query result:', docs);

      if (docs.length > 0) {
        const maxValue = docs[0].ABC;
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
app.post(Ins, (req, res) => {
  const newCol1 = req.body.newCol1;
  const newCol2 = req.body.newCol2;
  const newCol3 = req.body.newCol3;
  const newCol4 = req.body.newCol4;
  const newCol5 = req.body.newCol5;
  MongoClient.connect(url)
    .then(client => {
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      // 構建 MongoDB 插入操作
      const insertDoc = {
        ABC: newCol1,
        NameABC: newCol2,
        NameABCTW: newCol3,
        NameABCEng: newCol4,
        Date: newCol5
      };
      return collection.insertOne(insertDoc)
        .then(result => {
          res.sendStatus(200);
          client.close();
        })
        .catch(error => {
          if (error instanceof Error && error.code === 11000) {
            res.status(409).send('單號已存在，請重新點選新增按鈕。'); // 回傳自定義的錯誤訊息，使用HTTP 409狀態碼代表衝突
          } else {
              console.log('Error:', error);
              res.sendStatus(500);
            }
        });
    })
    .catch(error => {
      console.log('Failed to connect to MongoDB:', error);
      res.sendStatus(500);
    });
});


const saltRounds = 10; // bcrypt雜湊所需的鹽值回合數
// 使用者註冊路由
app.post(Reg, async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    MongoClient.connect(url)
      .then(client => {
        const db = client.db(dbName);
        const collection = db.collection('users');
        // 檢查使用者名稱是否已存在
        collection.findOne({ username: username }, (err, user) => {
          if (err) {
            console.error('Failed to query data:', err);
            res.status(500).json({ error: 'Failed to query data' });
            return;
          }
          if (user) {
            res.status(409).json({ error: '使用者名稱已存在。' });
            return;
          }
          // 將新使用者插入資料庫
          collection.insertOne({ username: username, password: hashedPassword })
            .then(result => {
              console.log('使用者註冊成功：', username);
              res.json({ success: true }); // 返回 JSON 物件
              client.close();
            })
            .catch(error => {
              console.error('Failed to insert data:', error);
              res.sendStatus(500);
              client.close();
            });
        });
      })
      .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        res.sendStatus(500);
      });
  } catch (error) {
    console.error('密碼雜湊處理時出錯：', error);
    res.sendStatus(500);
  }
});


// 解析JSON請求體
app.use(express.json());
// 處理POST請求的路由
app.post('/submit-form', handlePostRequest);
const fetch = require('node-fetch');
// POST請求的處理函數
async function handlePostRequest(req, res) {
  try {
    const token = req.body.token; // 從前端獲取reCAPTCHA token
    // 向reCAPTCHA驗證API發送POST請求
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // 將token和reCAPTCHA金鑰發送到驗證API
      body: `secret=${secret_recaptchaV3_token}&response=${token}`,
    });
    const data = await response.json();
    // 根據驗證結果，向前端返回JSON回應
    if (data.success) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
      console.error('驗證問題');
    }
  } catch (error) {
    console.error('驗證失敗:', error);
    res.status(500).json({ success: false, error: '驗證失敗' });
  }
}


// 處理POST請求的路由
app.post('/submit-form02', handlePostRequest02);
const fetch02 = require('node-fetch');
// POST請求的處理函數
async function handlePostRequest02(req, res) {
  try {
    const token = req.body.token; // 從前端獲取reCAPTCHA token
    // 向reCAPTCHA驗證API發送POST請求
    const response = await fetch02('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // 將token和reCAPTCHA金鑰發送到驗證API
      body: `secret=${secret_recaptchaV2_token}&response=${token}`,

    });
    const data = await response.json();
    // 根據驗證結果，向前端返回JSON回應
    if (data.success) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('驗證失敗:', error);
    res.status(500).json({ success: false, error: '驗證失敗' });
  }
}


// 配置 LocalStrategy
passport.use(new LocalStrategy(
  function (username, password, done) {
    MongoClient.connect(url)
      .then(client => {
        const db = client.db(dbName);
        const collection = db.collection('users');

        collection.findOne({ username: username }, async (err, user) => {
          if (err) {
            console.error('Failed to query data:', err);
            return done(null, false, { message: 'Failed to query data' });
          }
          if (!user) {
            return done(null, false, { message: '無效的使用者名稱或密碼。' });
          }
          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (isPasswordMatch) {
            console.log('使用者登入成功：', username);
            return done(null, user); // 驗證成功
          } else {
            return done(null, false, { message: '無效的使用者名稱或密碼。' }); // 驗證失敗
          }
        });
      })
      .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        return done(error);
      });
  }
));

// 序列化使用者物件到 session
passport.serializeUser(function (user, done) {
  done(null, user.username); // 使用 username 作為唯一識別碼
});

// 反序列化使用者物件
passport.deserializeUser(function (username, done) {
  try {
    MongoClient.connect(url)
      .then(client => {
        const db = client.db(dbName);
        const collection = db.collection('users');

        // 從資料庫中獲取使用者物件
        collection.findOne({ username: username }, (err, user) => {
          if (err) {
            console.error('反序列化使用者物件時出錯：', err);
            return done(err);
          }
          return done(null, user);
        });
      })
      .catch(err => {
        console.error('反序列化使用者物件時連接資料庫出錯：', err);
        return done(err);
      });
  } catch (err) {
    console.error('反序列化使用者物件時出錯：', err);
    return done(err);
  }
});


// 確保在 passport 初始化之後使用 session
app.use(session({ secret: passport_session_secret, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// 建立一個 Google 策略。
const googleStrategy = new GoogleStrategy({
  clientID: clientID_OAuth2_0,
  clientSecret: clientSecret_OAuth2_0,
  callbackURL: callbackURL_OAuth2_0,
}, (accessToken, refreshToken, profile, done) => {
  // 存儲使用者資訊。
  const user = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
  };
  // 完成登入。
  done(null, user);
});

// 註冊 Google 策略。
passport.use(googleStrategy);

// 建立一個登入路由。
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


const axios = require('axios'); // 引入 axios 模組
// 後端處理授權碼的路由
app.post('/auth/google/callback', async (req, res) => {
  const authorizationCode = req.body.code;

  // 使用授權碼向 Google 伺服器發送請求以交換訪問權杖
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code: authorizationCode,
        client_id: clientID_OAuth2_0, // 替換為你的 Google 用戶端 ID
        client_secret: clientSecret_OAuth2_0, // 替換為你的 Google 用戶端金鑰
        redirect_uri: callbackURL_OAuth2_0, // 與你的重新導向 URI 保持一致
        grant_type: 'authorization_code'
      }
    });

    // 從回應中獲取訪問權杖
    const accessToken = response.data.access_token;
    const secretKey = Token_secretKey; // 替換為你的秘密金鑰

    // 生成JWT
    const expiresIn = 3600; // 權杖的有效期，這裡設置為一小時（單位是秒）
    const token = jwt.sign({}, secretKey, { expiresIn }); // 注意這裡不再包含 userId
    const expirationTime = Date.now() + expiresIn * 1000;

    // 直接將JWT作為JSON對象返回給前端
    res.json({ token, expirationTime });
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});


// 確保用戶已經登錄的中介軟體
function ensureAuthenticated(req, res, next) {
  console.log(`進入ensureAuthenticated值`,req.isAuthenticated())

  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}
const auth = require('passport').authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login',
});


const jwt = require('jsonwebtoken');
// 登入路由
app.post(LoginLogin, passport.authenticate('local'), function(req, res) {
  // 登錄成功後，生成JWT
  const user = req.user;
  console.log('進入login的user值',user,'值req.user值',req.user)

  const secretKey = Token_secretKey; // 這裡應該是一個隨機且保密的字串，用於簽署JWT

  // 生成JWT
  const expiresIn = 3600; // 權杖的有效期，這裡設定為一小時（單位是秒）
  const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn });
  const expirationTime = Date.now() + expiresIn * 1000;

  // 直接將JWT作為JSON對象返回給前端
  res.json({ token, expirationTime });
});


// 自訂中介軟體，用於驗證用戶是否已登錄
const authenticateUser = (req, res, next) => {
  console.log('進入中介軟體')
  // 從請求頭中獲取 Authorization 欄位
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 提取權杖部分
  if (token == null) {
    // 如果沒有提供權杖，則返回未授權的回應
    return res.status(401).json({ error: '未登錄或會話已過期。' });
  }
  // 驗證權杖
  jwt.verify(token, Token_secretKey, (err, user) => {
    if (err) {
      // 權杖驗證失敗，返回未授權的回應
      return res.status(401).json({ error: '未登錄或會話已過期。' });
    }
    // 權杖驗證成功，將使用者資訊添加到請求物件中，方便後續路由處理常式使用
    req.user = user;
    next();
  });
};


// 建立只有登入才能連線的路由
app.get(DataData, authenticateUser, (req, res) => {
  // 使用者已登入，因此可以存取此路由
  // 設定允許的來源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  const searchInput = req.query.search;
  const engName = req.query.engName;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.error('Failed to connect to MongoDB:', err);
      res.status(500).send('Failed to connect to MongoDB');
      return;
    }
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    // 構建 MongoDB 查詢條件
    let query = {};
    if (searchInput) {
      query.ABC = { $regex: searchInput };
    }
    if (engName) {
      query.NameABCEng = { $regex: engName };
    }
    if (startDate && endDate) {
      query.Date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.Date = { $gte: startDate };
    } else if (endDate) {
      query.Date = { $lte: endDate };
    }
    console.log('engName:', engName);
    // 查詢資料
    collection.find(query).toArray(function(err, docs) {
      if (err) {
        console.error('Failed to query data:', err);
        res.status(500).send('Failed to query data');
        return;
      }
      console.log('查詢碼:', JSON.stringify(query));
      const filteredDocs = docs.map(doc => ({
        ABC: doc.ABC,
        NameABC: doc.NameABC,
        NameABCTW: doc.NameABCTW,
        NameABCEng: doc.NameABCEng,
        Date: doc.Date
      }));
      res.json(filteredDocs);

      client.close();
    });
  });
});

// 登出路由
app.post(LogoutLogout, (req, res) => {
  console.log(`進入logout`);

  // 這裡不需要使用Passport的方法來處理登出，只需要回傳一個成功的訊息即可
  res.json({ message: '登出成功' });
});

const path = require('path');
// 設定靜態檔案目錄，使前端檔案可供訪問
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

// 設定 /frontend 路由，並將使用者導向 index.html
app.get('/frontend', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend', 'index.html');
  res.sendFile(indexPath);
});




app.post('/sensitive-info', (req, res) => {
  const useSensitiveEnv = req.body.useSensitiveEnv;
  // 使用對應的敏感訊息檔案
  const envPath = useSensitiveEnv ? 'sensitive.env' : 'sensitive00.env'; //sensitive.env對應aws前端伺服器使用相對路徑。sensitive00.env對應GitHub page使用絕對路徑。
  require('dotenv').config({ path: envPath });

  const recaptcha01 = process.env.google_recaptcha01;
  const recaptcha02 = process.env.google_recaptcha02;
  const index_js01 = process.env.index_js01;
  const index_js02 = process.env.index_js02;
  const index_js03 = process.env.index_js03;
  const index_js04 = process.env.index_js04;
  const index_js05 = process.env.index_js05;
  const index_js06 = process.env.index_js06;

  const GridBranch01_js01 = process.env.GridBranch01_js01;
  const GridBranch01_js02 = process.env.GridBranch01_js02;
  const GridBranch01_js03 = process.env.GridBranch01_js03;
  const GridBranch01_js04 = process.env.GridBranch01_js04;
  const GridBranch01_js05 = process.env.GridBranch01_js05;

  const GridBranch01Detail_js01 = process.env.GridBranch01Detail_js01;
  const GridBranch01Detail_js02 = process.env.GridBranch01Detail_js02;
  const GridBranch01Detail_js03 = process.env.GridBranch01Detail_js03;
  const GridBranch01Detail_js04 = process.env.GridBranch01Detail_js04;
  const GridBranch01Detail_js05 = process.env.GridBranch01Detail_js05;
  
  const sensitiveInfo = {
    recaptcha01,
    recaptcha02,
    index_js01,
    index_js02,
    index_js03,
    index_js04,
    index_js05,
    index_js06,

    GridBranch01_js01,
    GridBranch01_js02,
    GridBranch01_js03,
    GridBranch01_js04,
    GridBranch01_js05,

    GridBranch01Detail_js01,
    GridBranch01Detail_js02,
    GridBranch01Detail_js03,
    GridBranch01Detail_js04,
    GridBranch01Detail_js05,
  };

  res.json(sensitiveInfo);
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


