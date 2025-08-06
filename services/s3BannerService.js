const Redis = require("ioredis");

const AWS = require("aws-sdk");
const redis = new Redis();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const listFiles = async (req) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: req,
    };
    await s3.headObject(params).promise();
    const { Body } = await s3.getObject(params).promise();
    const jsonString = Body.toString("utf-8");
    let jsonData;
    try {
      jsonData = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Invalid JSON in S3 object:", parseErr.message);
      throw new Error(`Json file is not valid in ${req}`);
    }
    await redis.set(req, JSON.stringify(jsonData));
    return jsonData;
  } catch (err) {
    return err;
  }
};

async function getS3BannerData(req, res) {
  try {
    const { isAllRedisClear, endpoint } = req.body;
    if (isAllRedisClear === 1 && endpoint === "all") {
      const result = await redis.scan(0, "MATCH", "*", "COUNT", 1);
      const hasKeys = result[1].length > 0;
      if (hasKeys) {
        await redis.flushall(); // Clears only current DB
        return res.json({ message: "all redis data cleared" });
      } else {
        return res.json({ message: "no data is present in redis" });
      }
    } else if (endpoint && isAllRedisClear === 1 && endpoint !== "all") {
      const value = await redis.get(endpoint);
      if (value) {
        await redis.del(endpoint);
        return res.json({ message: `redis data cleared for ${endpoint}` });
      } else {
        return res
          .status(200)
          .json({ message: `No data found for ${endpoint} in redis` });
      }
    } else if (isAllRedisClear === 0 && endpoint) {
      const cached = await redis.get(endpoint);
      if (!cached) {
        const jsonData = await listFiles(endpoint);
        if (jsonData && jsonData?.message !== null) {
          return res.json({
            message: "Not found in Redis served from s3",
            data: jsonData,
          });
        } else {
          return res.status(404).json({
            message: "required data not found",
          });
        }
      }
      const json = JSON.parse(cached);
      return res.json({ message: "served from redis", data: json });
    } else {
      return res.status(400).json({ error: "Invalid request parameters" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getS3BannerData };