import { v2 as cloudinary } from 'cloudinary'
import { MultipartFile } from '@fastify/multipart'
import envConfig from '@/config'

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (data: MultipartFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'uploads',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'))
        resolve(result.secure_url)
      }
    )

    // Không dùng streamifier, truyền stream gốc từ Fastify luôn
    data.file.pipe(uploadStream)
  })
}
