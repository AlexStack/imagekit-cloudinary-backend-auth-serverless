const serverless = require("serverless-http");
const express = require("express");
const ImageKit = require("imagekit");
const crypto = require('crypto')
const app = express();
app.use(express.json());

/**
 * Install: npm init && npm install && node index.js
 * API POST: http://localhost:5001/imageKitAuth
 * API POST: http://localhost:5001/cloudinaryAuth
 * 
 * ============ Example of .env ============ 
 * CLOUDINARY_API_KEY="98624656233"
 * CLOUDINARY_API_SECRET="eQq7lcKKGcNUr5fB_8aqNIk"
 * CLOUDINARY_API_BASE_URL="https://api.cloudinary.com/v1_1/pery"
 * CLOUDINARY_API_EAGER="c_limit,w_1600"
 * CLOUDINARY_API_UPLOAD_URL="https://api.cloudinary.com/v1_1/pery/image/upload"

 * IMAGEKIT_API_PUBLIC_KEY="public_4TznVN3Qst1FY51fJL8="
 * IMAGEKIT_API_PRIVATE_KEY="private_GDcEsLRTRpMvf5t1WII="
 * IMAGEKIT_API_END_POINT="https://ik.imagekit.io/ksos9gww"
 * IMAGEKIT_API_UPLOAD_URL="https://upload.imagekit.io/api/v1/files/upload"
 */
require("dotenv").config();



function imageKitAuth(req, res) {
  const keys = {
    publicKey: process.env.IMAGEKIT_API_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_API_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_API_END_POINT,
    uploadUrl: process.env.IMAGEKIT_API_UPLOAD_URL,
  };
  const imagekit = new ImageKit(keys);
  const auth = imagekit.getAuthenticationParameters();
  const rs = { ...keys, ...auth, ...{ privateKey: null } };
  res.json(rs);
}

function cloudinaryAuth(req, res) {
  const keys = {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    urlEndpoint: process.env.CLOUDINARY_API_BASE_URL,
  };

  timestamp = Math.round(new Date().getTime() / 1000);
  eager = process.env.CLOUDINARY_API_EAGER || 'c_limit,w_1600';
  public_id = 'ctx.query.public_id';
  serializedSortedParameters = 'eager=' + eager +
    '&public_id=' + public_id +
    '&timestamp=' + timestamp +
    keys.apiSecret;
  console.log('serializedSortedParameters', serializedSortedParameters);
  // signature = sha1(serializedSortedParameters);
  signature = crypto.createHash("sha1").update(serializedSortedParameters, "binary").digest("hex");

  const auth = {
    eager: eager,
    public_id: public_id,
    timestamp: timestamp,
    signature: signature,
    uploadUrl: process.env.CLOUDINARY_API_UPLOAD_URL,

  };
  const rs = { ...keys, ...auth, ...{ apiSecret: null } };
  res.json(rs);
}

app.get(process.env.API_BASE + "/imageKitAuth", imageKitAuth);
app.get(process.env.API_BASE + "/cloudinaryAuth", cloudinaryAuth);



const isServerless = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (isServerless) {
  module.exports.handler = serverless(app);
} else {
  app.listen(5002, () => {
    console.log(`Server started...`);
  });
}