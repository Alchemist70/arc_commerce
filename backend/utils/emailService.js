const nodemailer = require("nodemailer");

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify the transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email service configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to format order items into HTML
const formatOrderItems = (items) => {
  return items
    .map(
      (item) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
              item.name || "Unknown Product"
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
              item.quantity
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${
              typeof item.price === "number" ? item.price.toFixed(2) : "0.00"
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${(
              (item.price || 0) * (item.quantity || 1)
            ).toFixed(2)}</td>
        </tr>
    `
    )
    .join("");
};

const getStatusMessage = (status) => {
  switch (status.toLowerCase()) {
    case "shipped":
      return "Great news! Your order is on its way.";
    case "delivered":
      return "Your order has been delivered successfully.";
    case "cancelled":
      return "Your order has been cancelled as requested.";
    default:
      return `Your order status has been updated to: ${status}`;
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "shipped":
      return "#0275d8";
    case "delivered":
      return "#5cb85c";
    case "cancelled":
      return "#d9534f";
    default:
      return "#4a90e2";
  }
};

const sendOrderStatusEmail = async (orderDetails) => {
  console.log("Preparing to send order status update email:", {
    orderId: orderDetails.orderId,
    email: orderDetails.email,
    status: orderDetails.status,
  });

  if (!orderDetails.email) {
    throw new Error("Email address is required");
  }

  const { email, orderId, status, firstName, lastName } = orderDetails;
  const statusMessage = getStatusMessage(status);
  const statusColor = getStatusColor(status);

  const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColor};">Order Status Update - ARS Kart</h2>
            <p>Dear ${firstName} ${lastName},</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: ${statusColor};">${statusMessage}</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>New Status:</strong> <span style="color: ${statusColor};">${status}</span></p>
                <p><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
            </div>

            ${
              status.toLowerCase() === "shipped"
                ? `
                <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Tracking Information</h3>
                    <p>You will receive a separate email with your tracking details soon.</p>
                </div>
            `
                : ""
            }

            ${
              status.toLowerCase() === "delivered"
                ? `
                <p>We hope you are satisfied with your purchase. If you have any issues, please don't hesitate to contact us.</p>
            `
                : ""
            }

            ${
              status.toLowerCase() === "cancelled"
                ? `
                <p>If you didn't request this cancellation or have any questions, please contact us immediately.</p>
            `
                : ""
            }

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p>If you have any questions about your order, please contact our customer service:</p>
                <p>Email: support@arskart.com</p>
                <p>Phone: 1-800-ARS-KART</p>
            </div>
        </div>
    `;

  try {
    console.log("Attempting to send status update email to:", email);
    const info = await transporter.sendMail({
      from: '"ARS Kart" <noreply@arskart.com>',
      to: email,
      subject: `Order Status Update - Order #${orderId}`,
      html: emailHtml,
    });
    console.log("Order status update email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending order status update email:", {
      error: error.message,
      stack: error.stack,
      email,
      orderId,
      status,
    });
    throw error;
  }
};

const sendOrderConfirmationEmail = async (orderDetails) => {
  console.log("Preparing to send order confirmation email:", {
    orderId: orderDetails.orderId,
    email: orderDetails.email,
  });

  if (!orderDetails.email) {
    throw new Error("Email address is required");
  }

  const { email, orderId, items, total, shipping, firstName, lastName } =
    orderDetails;

  const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Order Confirmation - ARS Kart</h2>
            <p>Dear ${firstName} ${lastName},</p>
            <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #4a90e2; color: white;">
                        <th style="padding: 10px;">Product</th>
                        <th style="padding: 10px;">Quantity</th>
                        <th style="padding: 10px;">Price</th>
                        <th style="padding: 10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${formatOrderItems(items)}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                        <td style="padding: 10px;"><strong>$${
                          typeof total === "number" ? total.toFixed(2) : "0.00"
                        }</strong></td>
                    </tr>
                </tfoot>
            </table>

            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Shipping Details</h3>
                <p><strong>Address:</strong> ${shipping.address}</p>
                <p><strong>City:</strong> ${shipping.city}</p>
                <p><strong>State:</strong> ${shipping.state}</p>
                <p><strong>ZIP Code:</strong> ${shipping.zipCode}</p>
            </div>

            <p>We will send you another email when your order ships.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p>If you have any questions about your order, please contact our customer service:</p>
                <p>Email: support@arskart.com</p>
                <p>Phone: 1-800-ARS-KART</p>
            </div>
        </div>
    `;

  try {
    console.log("Attempting to send email to:", email);
    const info = await transporter.sendMail({
      from: '"ARS Kart" <noreply@arskart.com>',
      to: email,
      subject: `Order Confirmation - Order #${orderId}`,
      html: emailHtml,
    });
    console.log("Order confirmation email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending order confirmation email:", {
      error: error.message,
      stack: error.stack,
      email,
      orderId,
    });
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};
