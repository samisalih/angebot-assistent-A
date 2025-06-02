
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { AppointmentConfirmationEmail } from './_templates/appointment-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentConfirmationRequest {
  customerEmail: string;
  customerName?: string;
  appointmentDate: string;
  appointmentTime: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send appointment confirmation function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const requestData: AppointmentConfirmationRequest = await req.json();
    console.log("Request data:", requestData);

    const {
      customerEmail,
      customerName,
      appointmentDate,
      appointmentTime,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
    } = requestData;

    // Validate required fields
    if (!customerEmail || !appointmentDate || !appointmentTime) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: customerEmail, appointmentDate, or appointmentTime" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Render the email template
    const emailHtml = await renderAsync(
      React.createElement(AppointmentConfirmationEmail, {
        customerName,
        appointmentDate,
        appointmentTime,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: `${companyName || "Beratungsunternehmen"} <onboarding@resend.dev>`,
      to: [customerEmail],
      subject: "Terminbestätigung - Ihr Beratungstermin",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Appointment confirmation email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-appointment-confirmation function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send appointment confirmation email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
