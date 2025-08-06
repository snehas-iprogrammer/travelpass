// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { getS3BannerData } = require('../services/s3BannerService');


router.post('/getData', async (req, res) => {
  try {
    const data = await getS3BannerData(req, res);
//    return res.type('application/json').send(data);
if(data && data.length>0){
      return res.type('application/json').send(data);
    }  
} catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch banner JSON' });
  }
});



module.exports = router;
