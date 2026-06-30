import fs from 'fs'
import imagekit from '../config/imageKit.config';
import { fileURLToPathBuffer } from 'url';

export const addBlog = async(req,res)=>{
    try{
        const {title,subTitle,description,category,isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file;

        if(!title||!subTitle||!description||!category||!isPublished){
            return res.status(400).JSON({
                message : "Please fill all fields !"
            })
        }

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.files.upload(
            { 
                file: fileBuffer,
                fileName: imageFile.originalname 
            }
        );

        const imageTransformation = client.helper.buildSrc({
            urlEndpoint: 'https://ik.imagekit.io/your_imagekit_id',
            src: response.url,
            transformation: [
              {
                width: 400,
                height: 300,
                crop: 'maintain_ratio',
                quality: 80,
                format: 'webp',
              },
            ],
        })  
        console.log("imageTransformation",imageTransformation)

    }catch(err){
        console.error(err);
    }
}