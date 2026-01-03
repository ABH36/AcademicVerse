const getBaseStyle = () => `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`;

const getHeader = () => `
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
    <h2 style="color: #0f172a; margin: 0;">Academic<span style="color: #3b82f6;">Verse</span></h2>
    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Official Hiring Authority</p>
  </div>
`;

const getFooter = () => `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #94a3b8;">
    <p>© ${new Date().getFullYear()} AcademicVerse Inc. All rights reserved.</p>
    <p>This is an automated notification. Please do not reply directly.</p>
  </div>
`;

exports.generateEmailHtml = (type, data) => {
  const style = getBaseStyle();
  const header = getHeader();
  const footer = getFooter();
  let content = '';
  let color = '#3b82f6'; // Default Blue

  switch (type) {
    case 'interview':
      color = '#3b82f6';
      content = `
        <h2 style="color: ${color};">Interview Invitation</h2>
        <p>Dear <strong>${data.name}</strong>,</p>
        <p><strong>${data.company}</strong> has shortlisted you for the position of <strong>${data.jobTitle}</strong> and would like to conduct an interview.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid ${color}; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${data.date}</p>
          <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${data.time}</p>
          <p style="margin: 5px 0;"><strong>📍 Mode:</strong> ${data.mode}</p>
          <p style="margin: 5px 0;"><strong>🔗 Link/Venue:</strong> ${data.link}</p>
        </div>
        
        <p><strong>Instructions:</strong> ${data.message}</p>
        <p>Please log in to your dashboard to view full details.</p>
      `;
      break;

    case 'offer':
      color = '#10b981'; // Green
      content = `
        <h2 style="color: ${color};">🎉 Congratulations! Offer Received</h2>
        <p>Dear <strong>${data.name}</strong>,</p>
        <p>We are thrilled to inform you that <strong>${data.company}</strong> wants to hire you for the role of <strong>${data.jobTitle}</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/applications" 
             style="background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
             View & Accept Offer
          </a>
        </div>
        <p>Please respond promptly via the AcademicVerse dashboard.</p>
      `;
      break;

    case 'rejected':
      color = '#ef4444'; // Red
      content = `
        <h2 style="color: ${color};">Application Update</h2>
        <p>Dear <strong>${data.name}</strong>,</p>
        <p>Thank you for your interest in <strong>${data.company}</strong>. After careful consideration, the recruitment team has decided to move forward with other candidates for the <strong>${data.jobTitle}</strong> position.</p>
        <p>We encourage you to apply for other opportunities on AcademicVerse.</p>
      `;
      break;

    case 'hired':
      color = '#8b5cf6'; // Purple
      content = `
        <h2 style="color: ${color};">🚀 You are Officially Hired!</h2>
        <p>Congratulations <strong>${data.name}</strong>!</p>
        <p>You have successfully accepted the offer from <strong>${data.company}</strong>.</p>
        <p>The job posting has been closed and your status is now <strong>HIRED</strong>.</p>
        <p>Good luck on your new journey!</p>
      `;
      break;
  }

  return `
    <div style="${style}">
      ${header}
      ${content}
      ${footer}
    </div>
  `;
};