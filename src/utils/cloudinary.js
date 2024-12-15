// WHAT IS THE USE OF THIS UTIL FILE?
// initially files are uploaded on server, ab server se file ka jo path milega, uska use ham is "cloudinary.js" util me karenge taaki main us file ko apne server se cloudinary pe upload kar saku and remove that file from the server's local storage
import {v2 as cloudinary} from 'cloudinary';
import {fs} from 'fs';//file system = fs=>file handling

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto',
        });
        // file has been uploaded successfully
        console.log("file uploaded on cloudinary successfully::",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary};