import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-west-2' });

export const handler = async (event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const fileName = event.Records[0].s3.object.key;
  const fileSize = event.Records[0].s3.object.size;

  // console.log(`${bucketName} ... ${fileName} ... ${fileSize}`)

  const getImageManifest = {
    Bucket: bucketName,
    Key: 'images.json',
  };

  try {
    const manifest = await s3Client.send(
      new GetObjectCommand(getImageManifest),
    );

    let imagesArray = await manifest.Body.transformToString();
    imagesArray = JSON.parse(imagesArray);

    const newImageData = {
      fileName,
      fileSize,
      type: fileName.slice(fileName.indexOf('.')),
    };

    let foundMatch = false;

    // checks to see if image already exists and updates it if it does
    imagesArray.forEach((image, idx) => {
      if (image.fileName === newImageData.fileName) {
        imagesArray[idx] = newImageData;
        console.log('FOUND MATCH, UPDATING IMAGE: ', image);
        foundMatch = true;
        return;
      }
    });

    console.log('UPDATED IMAGES.JSON DATA: ', imagesArray);

    // if image does not already exist in manifest, then add it
    if (!foundMatch) {
      imagesArray.push(newImageData);
    }

    await s3Client.send(
      new PutObjectCommand({
        Body: JSON.stringify(imagesArray),
        Bucket: bucketName,
        Key: 'images.json',
      }),
    );
  } catch (e) {
    if (e.Code === 'NoSuchKey') {
      //create new manifest here
      await s3Client.send(
        new PutObjectCommand({
          Body: JSON.stringify([
            [
              {
                fileName,
                fileSize,
                type: fileName.slice(fileName.indexOf('.')),
              },
            ],
          ]),
          Bucket: bucketName,
          Key: 'images.json',
        }),
      );
    }
    console.log(e);
  }

  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
