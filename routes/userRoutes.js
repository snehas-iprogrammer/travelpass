// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { getS3BannerData } = require('../services/s3BannerService');
const emailService = require('../services/emailService');


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

router.post('/send-email', async (req, res) => {
    try {
        const requestData = req.body;
        if (!requestData || Object.keys(requestData).length === 0) {
            return res.status(400).json({ error: 'Request body cannot be empty' });
        }

        const result = await emailService.sendEmail(requestData);
        console.log('Response: Email sent successfully:', result.messageId);
        res.status(200).json({ message: 'Email sent successfully', messageId: result.messageId });
    } catch (error) {
        console.error('Response: Error sending email:', error.message);
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
