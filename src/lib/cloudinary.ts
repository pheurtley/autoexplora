import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export const CLOUDINARY_UPLOAD_PRESET = "autoexplora";

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface PlateRegion {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/**
 * Upload image to Cloudinary
 * Note: Image processing (blur, watermark) is done with Sharp before upload
 */
export async function uploadToCloudinary(
  file: Buffer,
  folder: string = "vehicles"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `autoexplora/${folder}`,
          resource_type: "image",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new Error("Upload failed"));
          }
        }
      )
      .end(file);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  url: string,
  transformation: "thumbnail" | "card" | "gallery" | "full" = "card"
): string {
  const transformations = {
    thumbnail: "w_400,h_300,c_fill,q_auto,f_auto",
    card: "w_600,h_400,c_fill,q_auto,f_auto",
    gallery: "w_1200,h_800,c_fill,q_auto,f_auto",
    full: "w_1920,h_1080,c_fit,q_auto,f_auto",
  };

  // Insert transformation into Cloudinary URL
  return url.replace("/upload/", `/upload/${transformations[transformation]}/`);
}
