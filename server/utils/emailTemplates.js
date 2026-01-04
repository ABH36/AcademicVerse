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

  // Ensure Fallbacks to prevent "undefined" in emails
  const name = data.name || 'Candidate';
  const company = data.company || 'Our Company';
  const jobTitle = data.jobTitle || 'the position';

  // Match the exact status string from Controller ('interview', 'offered', 'rejected', 'hired')
  switch (type) {
    case 'interview':
      color = '#3b82f6';
      content = `
        <h2 style="color: ${color};">Interview Invitation</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p><strong>${company}</strong> has shortlisted you for the position of <strong>${jobTitle}</strong> and would like to conduct an interview.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid ${color}; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${data.date || 'TBD'}</p>
          <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${data.time || 'TBD'}</p>
          <p style="margin: 5px 0;"><strong>📍 Mode:</strong> ${data.mode || 'Online'}</p>
          <p style="margin: 5px 0;"><strong>🔗 Link/Venue:</strong> ${data.link || 'Check Dashboard'}</p>
        </div>
        
        <p><strong>Instructions:</strong> ${data.message || 'Please be on time.'}</p>
        <p>Please log in to your dashboard to view full details.</p>
      `;
      break;

    // Updated to match 'offered' status from DB
    case 'offered': 
    case 'offer': // Fallback just in case
      color = '#10b981'; // Success Green
      content = `
        <h2 style="color: ${color};">🎉 Official Job Offer</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We are delighted to offer you the position of <strong>${data.role || jobTitle}</strong> at <strong>${company}</strong>!</p>
        
        <div style="background: #ecfdf5; padding: 20px; border: 1px solid ${color}; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top:0; color: ${color};">Offer Details</h3>
          <p style="margin: 8px 0;"><strong>💰 CTC / Salary:</strong> ${data.salary || 'As Discussed'}</p>
          <p style="margin: 8px 0;"><strong>🗓 Joining Date:</strong> ${data.joiningDate || 'Immediate'}</p>
          
          <p style="margin: 8px 0;"><strong>📍 Reporting Location:</strong> ${data.location || 'Remote / Main Office'}</p>
          <p style="margin: 8px 0;"><strong>👤 Reporting Manager:</strong> ${data.manager || 'Hiring Manager'}</p>
          
          <hr style="border: 0; border-top: 1px dashed #a7f3d0; margin: 15px 0;"/>
          
          <p style="font-style: italic; color: #065f46;">"${data.message || 'We look forward to working with you!'}"</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/applications" 
             style="background-color: ${color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
             Review & Accept Offer
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666;">Please accept this offer via your dashboard to initiate onboarding.</p>
      `;
      break;

    case 'rejected':
      color = '#ef4444'; // Red
      content = `
        <h2 style="color: ${color};">Application Update</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for your interest in <strong>${company}</strong>. After careful consideration, the recruitment team has decided to move forward with other candidates for the <strong>${jobTitle}</strong> position.</p>
        <p>We encourage you to apply for other opportunities on AcademicVerse.</p>
      `;
      break;

    case 'hired':
      color = '#8b5cf6'; // Purple
      content = `
        <h2 style="color: ${color};">🚀 You are Officially Hired!</h2>
        <p>Congratulations <strong>${name}</strong>!</p>
        <p>You have successfully accepted the offer from <strong>${company}</strong>.</p>
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