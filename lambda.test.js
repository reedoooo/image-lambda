const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { handler } = require('./yourLambdaFunction');

// Mock the S3Client and its methods
jest.mock('@aws-sdk/client-s3');
const mockedS3Client = new S3Client();
jest.mock('GetObjectCommand');
jest.mock('PutObjectCommand');

// Sample event for testing
const sampleEvent = {
  Records: [
    {
      s3: {
        bucket: {
          name: 'your-bucket-name',
        },
        object: {
          key: 'your-object-key.jpg',
          size: 1024,
        },
      },
    },
  ],
};

describe('Lambda Function', () => {
  beforeEach(() => {
    // Clear mock calls and instances before each test
    jest.clearAllMocks();
  });

  it('should update an existing image in the images.json manifest', async () => {
    // Mock the GetObjectCommand response
    mockedS3Client.send.mockResolvedValue({
      Body: {
        transformToString: jest.fn().mockResolvedValue(JSON.stringify([{ fileName: 'your-object-key.jpg', fileSize: 512, type: '.jpg' }])),
      },
    });

    // Call the handler with the sample event
    await handler(sampleEvent);

    // Expectations
    expect(mockedS3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    expect(mockedS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(mockedS3Client.send).toHaveBeenCalledTimes(2);
  });

  it('should create a new images.json manifest if it does not exist', async () => {
    // Mock the GetObjectCommand response with NoSuchKey error
    mockedS3Client.send.mockRejectedValue({ Code: 'NoSuchKey' });

    // Call the handler with the sample event
    await handler(sampleEvent);

    // Expectations
    expect(mockedS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(mockedS3Client.send).toHaveBeenCalledTimes(1);
  });
});
