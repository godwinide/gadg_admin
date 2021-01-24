const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.AccessKeyID,
    secretAccessKey: process.env.SecretAccessKey
});

const Bucket = "gadg6";
const Bucket2 = "gadg6";

module.exports.upload = (Body, Key, cb=null) =>{
    return new Promise((resolve,reject)=>{
        s3.upload({Bucket, Body, Key}, null, async (err, data) => {
            if(data){
                if(cb){
                    cb(data);                    
                }
                return resolve(data)
            }
            if(err){
                console.error(err);
                return reject(err);
            }
        })
    })
}

module.exports.uploadPDF = (Body, Key, cb=null) =>{
    return new Promise((resolve,reject)=>{
        s3.upload({Bucket: Bucket2, Body, Key}, null, async (err, data) => {
            if(data){
                if(cb){
                    cb(data);                    
                }
                return resolve(data)
            }
            if(err){
                console.error(err);
                return reject(err);
            }
        })
    })
}
