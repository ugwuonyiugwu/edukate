// @/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server"; // Added for middleware authentication

const f = createUploadthing();

export const ourFileRouter = {
  // Existing PDF Uploader
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Existing Thumbnail Uploader
  thumbnailUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Existing Library Cover Uploader
  libraryThumbnailUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // NEW: Dedicated uploader for Quizathon Submissions
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // This runs on your server before upload
      const user = await auth();
      
      // If throw, the user cannot upload
      if (!user || !user.userId) throw new Error("Unauthorized");
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This runs on your server after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { url: file.url, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;