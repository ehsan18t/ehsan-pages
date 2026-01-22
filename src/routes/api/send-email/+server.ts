import { EMAIL_PASSWORD, EMAIL_USER } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import type { RequestHandler } from './$types';

// Define the mail transporter using your SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.to || !body.subject) {
            throw error(400, 'Missing required fields: to and subject');
        }

        // Send the email using the parsed data
        const info = await transporter.sendMail({
            from: EMAIL_USER,
            to: body.to,
            subject: body.subject,
            text: body.text || '',
            html: body.html
        });

        return json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });
    } catch (err) {
        console.error('Error sending email:', err);

        // If it's already a SvelteKit error, re-throw it
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        throw error(500, {
            message: 'Failed to send email',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
