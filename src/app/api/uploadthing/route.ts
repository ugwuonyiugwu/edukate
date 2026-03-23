import { createRouteHandler } from "uploadthing/next";
import { UTApi } from "uploadthing/server"; 
import { ourFileRouter } from "./core";


export const utapi = new UTApi();

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});