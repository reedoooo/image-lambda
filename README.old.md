# S3 and Lambda Image Upload Handler

This Lambda function automatically processes image uploads to an S3 bucket.

## Usage

1. Set up an S3 bucket with "open" read permissions.
2. Configure an event trigger in the S3 bucket to invoke this Lambda function on image uploads.
3. When an image is uploaded, this Lambda function will download the existing 'images.json' file, create metadata for the uploaded image, update the image array (updating if necessary), and upload the updated 'images.json' file back to the S3 bucket.

## Deployment Issues

- No known deployment issues at the moment.

## images.json

The [images.json](link-to-images-json-file) file contains an array of objects, each representing an uploaded image. It includes metadata such as the name, size, type, and timestamp of the image.

