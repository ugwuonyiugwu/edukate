import { eq  } from "drizzle-orm";
import 
{ headers } from "next/headers"
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetTrackReadyWebhookEvent
} from "@mux/mux-node/resources/webhooks"
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";


const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type webhookEvent =
| VideoAssetCreatedWebhookEvent
| VideoAssetReadyWebhookEvent
| VideoAssetErroredWebhookEvent
| VideoAssetTrackReadyWebhookEvent;

export const POST = async (request: Request) => {
  if(!SIGNING_SECRET) {
    throw new Error("MUX_WEBHOOK_SECRET is not set");
  }

  const headersPyload = await headers();
  const muxSignature = headersPyload.get("mux-signature")

  if (!muxSignature) {
    return new Response("NO signature found", { status: 401 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET,
  );

  switch (payload.type as webhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", {status: 400});
      }
      await db
      .update(videos)
      .set({ 
        muxAssetId: data.id,
        muxStatus: data.status,
      })
      .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
  
    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = data.playback_ids?.[0].id;

      if (!data.upload_id){
        return new Response("Missing upload ID", {status: 400});
      }
      
        if (!playbackId){
        return new Response("Missing playback ID", {status: 400});
      }

      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

      await db
      .update(videos)
      .set({
        muxStatus: data.status,
        muxPlaybackId: playbackId,
        muxAssetId: data.id,
        thumbnailUrl,
      })
      .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
  
  
   return new Response("webhook received", {status: 200})
  } 
};