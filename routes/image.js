const express = require('express');
const router = express.Router();

const multer = require('multer');

const aws = require('aws-sdk');
var multerS3 = require('multer-s3');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

// ! cf> 서버에 폴더를 하나 만들고 그곳에 사진을 저장하고 싶다면 다음과 같이 하면 된다.
// const upload = multer({
//   dest: 'image/',
// });
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // ! 콘텐츠 타입을 자동으로 세팅(이 설정을 하지 않을 경우, 해당 사진이 저장된 URL로 접근 시 사진 다운로드가 진행된다.)
    acl: 'public-read', // ! 클라이언트에서 자유롭게 가용하기 위함
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname }); // ! check
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString()); // ! check
    },
  }),
  // limits: { fileSize: 5 * 1024 * 1024 }, // ! 용량과 관련
});

const imageController = require('../controllers/image');

// ! (samplecode)서버에 사진을 저장할 시.
router.post('/multer', upload.single('image'), imageController.multer);
// ! (samplecode)S3에 사진을 저장할 시.
router.post('/multers3', upload.single('image'), imageController.multers3);

router.post('/place', upload.single('image'), imageController.place);

// ! check 여러 사진을 한번에 업로드하는 것과 관련.
// app.post('/upload', upload.array('photos', 3), function (req, res, next) {
//   res.send('Successfully uploaded ' + req.files.length + ' files!');
// });

module.exports = router;
