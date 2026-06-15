// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/app/lib/db";

export async function POST(req: Request) {
  // You will get this secret from your Clerk Dashboard > Webhooks
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers from the request
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", { status: 400 });
  }

  // Handle the User Created Event
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "New User";

    try {
      // Changed from .create() to .upsert()
      await prisma.user.upsert({
        where: { id: id }, // Check if user exists by their Clerk ID
        update: {
          email: email,
          name: name,
        },
        create: {
          id: id,
          email: email,
          name: name,
          role: "DEV",
        },
      });
      console.log(`User ${id} successfully synced in database`);
    } catch (error) {
      console.error("Error creating user in database:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
