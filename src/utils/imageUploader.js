const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dayz0mvdf',
    api_key: '713969598797478',
    api_secret: 'NuZSVSCkb3wLbt1uZ4mMTkQRfpo',
});

// Create the uploadImage function that your controller is expecting
exports.uploadImage = async (file) => {
  try {
    console.log('uploadImage received file:', file);
    
    // Check if file exists
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check if file has path
    if (!file.path) {
      console.log('File properties:', Object.keys(file));
      throw new Error('Invalid file format - no path property');
    }
    
    console.log('Uploading file from path:', file.path);
    
    // Upload the file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path);
    
    console.log('Upload successful, result:', uploadResult.secure_url);
    
    // Return the secure URL
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    throw error;
  }
};
