const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;
    
    // Download images.json if it exists
    let imagesData = [];
    try {
      const params = {
        Bucket: bucketName,
        Key: 'images.json'
      };
      const data = await s3.getObject(params).promise();
      imagesData = JSON.parse(data.Body.toString('utf-8'));
    } catch (error) {
      // If images.json doesn't exist, it will be created later
      console.log('images.json not found. Creating a new one.');
    }
    
    // Create metadata object for the uploaded image
    const imageMetadata = {
      name: objectKey,
      size: event.Records[0].s3.object.size,
      type: event.Records[0].s3.object.contentType,
      timestamp: new Date().toISOString()
    };
    
    // Check if image with the same name already exists
    const existingImageIndex = imagesData.findIndex(image => image.name === objectKey);
    if (existingImageIndex !== -1) {
      // Update existing image object in the array
      imagesData[existingImageIndex] = imageMetadata;
    } else {
      // Add new image object to the array
      imagesData.push(imageMetadata);
    }
    
    // Upload the updated images.json file back to S3
    const params = {
      Bucket: bucketName,
      Key: 'images.json',
      Body: JSON.stringify(imagesData),
      ContentType: 'application/json'
    };
    await s3.putObject(params).promise();
    
    console.log('Image upload and metadata update complete.');
    
    return {
      statusCode: 200,
      body: 'Image upload and metadata update complete.'
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      body: 'An error occurred.'
    };
  }
};
