import "dotenv/config";
import express from "express";

import path from "path";
import { fileURLToPath } from "url";
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Supabase Service Role
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // Custom Email Transporter
  const smtpPort = Number(process.env.EMAIL_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Often needed for custom SMTP
      minVersion: 'TLSv1.2'
    },
    requireTLS: smtpPort === 587 // Force STARTTLS for port 587
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP Connection Error:", error);
    } else {
      console.log("SMTP Server is ready");
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", smtp: !!process.env.EMAIL_USER });
  });

  // Custom Signup with Email Verification
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, fullName, phone } = req.body;
    console.log(`Attempting signup for: ${email}`);

    try {
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone }
      });

      if (authError) {
        console.error('Supabase Auth Error:', authError);
        throw authError;
      }

      const userId = authData.user.id;
      console.log(`User created in Auth: ${userId}`);

      // 1.5 Create profile in profiles table
      try {
        await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            phone: phone,
            role: 'user',
            is_verified: false
          });
      } catch (pErr) {
        console.warn('Profile insertion failed (might be trigger handled):', pErr);
      }

      // 2. Generate Verification Token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { error: tokenError } = await supabaseAdmin
        .from('verification_tokens')
        .insert({
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) {
        console.error('Token Insertion Error:', tokenError);
        throw tokenError;
      }

      // 3. Send Verification Email via Custom SMTP
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const verificationLink = `${appUrl}/verify-email/${token}`;

      console.log(`Sending verification email to: ${email}`);
      try {
        await transporter.sendMail({
          from: `"Nature Cures Initiative" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify your email - Nature Cures Initiative',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #064e3b;">Welcome to Nature Cures Initiative!</h1>
              <p>Thank you for joining us. Please verify your email address to complete your registration.</p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #064e3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">Nature Cures Initiative - Empowering Wellness Through Nature</p>
            </div>
          `
        });
        console.log('Email sent successfully');
      } catch (mailError: any) {
        console.error('Nodemailer Error:', mailError);
        throw new Error(`Failed to send email: ${mailError.message}`);
      }

      res.json({ success: true, message: 'Verification email sent' });
    } catch (error: any) {
      console.error('Signup process error:', error);
      res.status(400).json({ error: error.message || 'Failed to sign up' });
    }
  });

  // Verify Email Endpoint
  app.post("/api/auth/verify", async (req, res) => {
    const { token } = req.body;

    try {
      // 1. Find and validate token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (tokenError || !tokenData) throw new Error('Invalid or expired token');

      const isExpired = new Date(tokenData.expires_at) < new Date();
      if (isExpired) throw new Error('Token has expired');

      // 2. Update profile verification status
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', tokenData.user_id);

      if (profileError) throw profileError;

      // 3. Delete used token
      await supabaseAdmin
        .from('verification_tokens')
        .delete()
        .eq('id', tokenData.id);

      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(400).json({ error: error.message || 'Verification failed' });
    }
  });

  // Resend Verification Email Endpoint
  app.post("/api/auth/resend-verification", async (req, res) => {
    const { email } = req.body;
    console.log(`Resend verification requested for: ${email}`);

    try {
      // 1. Find user by email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) throw userError;

      const user = userData.users.find((u: any) => u.email === email);
      if (!user) throw new Error('User not found');

      // 2. Check if already verified in profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.is_verified) throw new Error('Email is already verified');

      // 3. Delete old tokens
      await supabaseAdmin
        .from('verification_tokens')
        .delete()
        .eq('user_id', user.id);

      // 4. Generate New Token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const { error: tokenError } = await supabaseAdmin
        .from('verification_tokens')
        .insert({
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) throw tokenError;

      // 5. Send Email
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const verificationLink = `${appUrl}/verify-email/${token}`;

      await transporter.sendMail({
        from: `"Nature Cures Initiative" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email - Nature Cures Initiative',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #064e3b;">Verify your email address</h1>
            <p>You requested a new verification link. Please click the button below to verify your email.</p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #064e3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
            <p>This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">Nature Cures Initiative</p>
          </div>
        `
      });

      res.json({ success: true, message: 'Verification email resent' });
    } catch (error: any) {
      console.error('Resend error:', error);
      res.status(400).json({ error: error.message || 'Failed to resend email' });
    }
  });

  // Admin: Update Order Status with Email Notification
  app.post("/api/admin/update-order-status", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    let { orderId, status, userId, email, orderNumber } = req.body;
    console.log(`Updating order ${orderNumber} to status: ${status}`);

    try {
      // 1. Update order status in database
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 1.5 If email is not provided, fetch it from Supabase Auth
      if (!email && userId) {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!userError && userData.user) {
          email = userData.user.email;
        }
      }

      if (!email) {
        console.warn('No email found for order update notification');
        return res.json({ success: true, warning: 'Status updated but no email sent' });
      }

      // 2. Send notification email to user
      const statusLabels: Record<string, string> = {
        'pending_payment': 'Pending Payment',
        'payment_confirmed': 'Payment Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };

      const statusLabel = statusLabels[status] || status;

      try {
        await transporter.sendMail({
          from: `"Nature Cures Initiative" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Order Update: ${orderNumber} is now ${statusLabel}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #064e3b; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0;">Order Update</h1>
              </div>
              <div style="padding: 32px;">
                <p>Hello,</p>
                <p>Your order <strong>${orderNumber}</strong> has been updated to: <span style="color: #064e3b; font-weight: bold;">${statusLabel}</span></p>
                <p>You can track your order status in your dashboard.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.APP_URL}/dashboard" style="background-color: #064e3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
                </div>
                <p>Thank you for choosing Nature Cures Initiative!</p>
              </div>
              <div style="background-color: #f9fafb; padding: 24px; text-align: center; color: #666; font-size: 12px;">
                <p>Nature Cures Initiative - Empowering Wellness Through Nature</p>
              </div>
            </div>
          `
        });
        console.log('Status update email sent');
      } catch (mailError) {
        console.error('Failed to send status update email:', mailError);
        // We don't throw here because the DB update was successful
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update order status error:', error);
      res.status(400).json({ error: error.message || 'Failed to update order status' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    // We cannot use await at the top level in CommonJS without care, but since server.ts is type="module" (ESM), 
    // it's fine. We will configure Vercel to use the compiled app or directly run it.
    // For Vercel, this block will be skipped.
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Production static serving locally
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  return app;
}

const serverPromise = startServer();

// @vercel/node expects a function export for serverless API routes
export default async function handler(req: any, res: any) {
  const app = await serverPromise;
  app(req, res);
}

if (!process.env.VERCEL) {
  serverPromise.then((app) => {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  });
}
