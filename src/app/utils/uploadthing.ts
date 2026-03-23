// src/app/utils/uploadthing.ts
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// 1. Generate the component constants
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// 2. Extract helpers to a private constant
const helpers = generateReactHelpers<OurFileRouter>();

// 3. EXPLICITLY export the hook and function
// Do not destructure them on the same line as the export
export const useUploadThing = helpers.useUploadThing;
export const uploadFiles = helpers.uploadFiles;