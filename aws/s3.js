const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.AccessKeyID,
    secretAccessKey: process.env.SecretAccessKey
});

const Bucket = "gadgacademia";

module.exports.upload = async (Body, Key, cb) =>{
    // create bucket if it doesn't exits
    s3.createBucket({Bucket}, (err) => err && console.log(err));
    // upload image
    s3.upload({Bucket, Body, Key}, null, async (err, data) => {
        if(data){
            cb(data);
        }
        if(err){
            console.error(err);
        }
    })
}
