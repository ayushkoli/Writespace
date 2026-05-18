import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import path from "path"

export const isCloudinaryConfigured = () =>
    Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )

export const getDefaultPhotoUrl = () => process.env.DEFAULTPHOTO || ""

const cleanupLocalFile = (localFilePath) => {
    if (!localFilePath) return
    try {
        const normalizedPath = path.resolve(localFilePath)
        if (fs.existsSync(normalizedPath)) {
            fs.unlinkSync(normalizedPath)
        }
    } catch (err) {
        console.error("Failed to remove temp file:", err.message)
    }
}

const uploadOnCloudinary = async (localFilePath) => {
    if (!isCloudinaryConfigured()) {
        console.warn("Cloudinary is not configured — skipping upload")
        cleanupLocalFile(localFilePath)
        return null
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

    try {
        if (!localFilePath) return null

        const normalizedPath = path.resolve(localFilePath)

        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto"
        })

        cleanupLocalFile(localFilePath)
        return response

    } catch (error) {
        console.error("Cloudinary upload failed:", error.message)
        cleanupLocalFile(localFilePath)
        return null
    }
}

/**
 * Try Cloudinary upload; on failure or missing config, return fallback URL so the app keeps working.
 */
export const uploadImageOrFallback = async (localFilePath, fallbackUrl = "") => {
    if (!localFilePath) {
        return { url: fallbackUrl, uploaded: false, warning: null }
    }

    const uploaded = await uploadOnCloudinary(localFilePath)
    const url = uploaded?.secure_url || uploaded?.url

    if (url) {
        return { url, uploaded: true, warning: null }
    }

    let warning = "Image could not be uploaded. The rest of your request was saved."
    if (!isCloudinaryConfigured()) {
        warning = "Image storage is not configured. The rest of your request was saved."
    }

    return { url: fallbackUrl, uploaded: false, warning }
}

export { uploadOnCloudinary }
