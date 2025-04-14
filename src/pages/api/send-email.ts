export const prerender = false;

import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

// Define the mail transporter using your SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: import.meta.env.EMAIL_USER,
    pass: import.meta.env.EMAIL_PASSWORD,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Send the email using the parsed data
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: body.to,
      subject: body.subject,
      text: body.text || "",
      html: body.html,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        messageId: info.messageId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to send email",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
