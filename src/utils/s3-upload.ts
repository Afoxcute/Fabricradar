import AWS from 'aws-sdk';

// Configure AWS S3 - moved to a function to only initialize when needed
const getS3Client = () => {
  return new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
};

/**
 * Generate a presigned URL for direct upload to S3
 * @param fileName - Name of the file to upload
 * @param fileType - MIME type of the file
 * @returns Object containing upload URL and the final file URL
 */
export const generatePresignedUrl = async (fileName: string, fileType: string) => {
  try {
    const s3 = getS3Client();
    const bucketName = process.env.AWS_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('AWS bucket name is not defined in environment variables');
    }

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Expires: 160, // URL expires in 160 seconds
      ContentType: fileType,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return { uploadUrl, fileUrl };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
};

/**
 * Delete a file from S3
 * @param fileName - Name of the file to delete
 * @returns Success message
 */
export const deleteFileFromS3 = async (fileName: string) => {
  try {
    const s3 = getS3Client();
    const bucketName = process.env.AWS_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('AWS bucket name is not defined in environment variables');
    }

    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    await s3.deleteObject(params).promise();
    return { message: "File deleted successfully" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("File deletion failed");
  }
};

/**
 * Generate a unique filename with timestamp and random string
 * @param originalName - Original filename
 * @returns Unique filename
 */
export const generateUniqueFileName = (originalName: string) => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 10);
  
  // Extract file extension
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}; 