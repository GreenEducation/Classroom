//https://github.com/leerob/nextjs-aws-s3/blob/main/bin/hello-cdk.js
import AWS from 'aws-sdk';
import { connectToDatabase } from "../../util/mongodb";

export default async function handler(req, res) {

  //Configure AWS
  const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com')
  AWS.config.update({
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    region: 'nyc3',
    signatureVersion: 'v4',
    endpoint: spacesEndpoint,
  });

  //Get a Presigned link to send a POST request to
  const s3 = new AWS.S3();
  const post = await s3.createPresignedPost({
    Bucket: 'greened-users',
    Fields: {
      key: req.query.file,
    },
    Expires: 60, // seconds
    //Conditions: [
    //  ['content-length-range', 0, 2097152], // up to 2 MB
    //],
  });

  //Record the upload to the DB
  const { db } = await connectToDatabase()
  db.collection("file_upload").insertOne(
    {
      user_id: req.query.user,
      file_url: 'https://greened-users.nyc3.digitaloceanspaces.com/' + req.query.file,
      file_type: 'Course',
      upload_time: new Date().toISOString()
    }
  )

  res.status(200).json(post);
}


/*
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
AWS.config.update({
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: 'nyc3',
  endpoint: spacesEndpoint,
});
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
});



// Use S3 ManagedUpload class as it supports multipart uploads
var upload = new AWS.S3.ManagedUpload({
  params: {
    Bucket: "greened-users",
    Key: file.name,
    Body: file
  }
})

var promise = upload.promise()
promise.then(
  function(data) {
    alert("Successfully uploaded photo.")
  },
  function(err) {
    return alert("There was an error uploading your photo: ", err.message)
  }
)

*/


/*
var params = {
  Bucket: "greened-users",
  Key: file.name,
  Body: file,
  ACL: "private"
};

s3.putObject(params, function(err, data) {
  if (err) {console.log(err, err.stack);}
  else     {console.log(data);}
});
*/