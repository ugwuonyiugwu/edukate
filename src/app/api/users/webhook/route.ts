import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add CLERK_SIGNING_SECRET from Dashboard to .env or .env.local"
    );
  }

  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Error out if headers are missing
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { data } = evt;

    const primaryEmail = data.email_addresses?.[0]?.email_address;
    const username = data.username; // This comes from your username input field

    await db.insert(users).values({
      clerkId: data.id,
      email: primaryEmail || "",
      username: username || "",
      imageUrl: data.image_url,
    });
    
    console.log(`User ${data.id} synced to DB`);
  }

  if (eventType === "user.updated") {
    const { data } = evt;
    const primaryEmail = data.email_addresses?.[0]?.email_address;
    const username = data.username;

    await db
      .update(users)
      .set({
        email: primaryEmail,
        username: username,
        imageUrl: data.image_url,
      })
      .where(eq(users.clerkId, data.id as string));
  }

  if (eventType === "user.deleted") {
    const { data } = evt;

    if (!data.id) {
      return new Response("Missing user id", { status: 400 });
    }
    
    await db.delete(users).where(eq(users.clerkId, data.id));
  }

  return new Response("Webhook received", { status: 200 });
}