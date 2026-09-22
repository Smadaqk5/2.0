// --- CONFIGURATION ---
const BOT_TOKEN = '8844584110:AAEQhiNcunGuzJvz6wqq2WEum8iCccqA5Rw'; // Replace this with your real bot token
const CHAT_ID = '7528512807';              // Replace this with your real chat ID
// ---------------------

const form = document.getElementById('dataForm');
const submitBtn = document.getElementById('submitBtn');
const successMsg = document.getElementById('successMsg');

const hasValidTelegramConfig = () => {
    const validBotToken = BOT_TOKEN && BOT_TOKEN.trim() && !BOT_TOKEN.includes('YOUR_');
    const validChatId = CHAT_ID && CHAT_ID.trim() && !CHAT_ID.includes('YOUR_');
    return validBotToken && validChatId;
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!hasValidTelegramConfig()) {
        alert('Telegram is not configured yet. Please replace the placeholder BOT_TOKEN and CHAT_ID values in SCRIPT.JS with your real credentials before submitting the form.');
        return;
    }
    
    // Disable button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

    // Gather data
    const formData = {
        fullName: document.getElementById('fullName').value,
        studentId: document.getElementById('studentId').value,
        phone: document.getElementById('phone').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        email: document.getElementById('email').value,
        altEmail: document.getElementById('altEmail').value,
        formerSchool: document.getElementById('formerSchool').value,
        submittedAt: new Date().toLocaleString()
    };

    // Format message for Telegram
    const message = `
<b>📝 New Student Data Submission</b>

<b>Full Name:</b> ${formData.fullName}
<b>Student ID:</b> ${formData.studentId}
<b>Phone:</b> ${formData.phone}
<b>Gender:</b> ${formData.gender}
<b>DOB:</b> ${formData.dob}
<b>Email:</b> ${formData.email}
<b>Alt Email:</b> ${formData.altEmail}
<b>Former School:</b> ${formData.formerSchool}

<b>🕒 Time:</b> ${formData.submittedAt}
            `;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // Send to Telegram
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            // Success
            form.reset();
            successMsg.style.display = 'block';
            submitBtn.innerHTML = 'Sent';
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMsg.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Data';
            }, 5000);
        } else {
            const errorText = await response.text();
            throw new Error(`Telegram API error: ${response.status} ${errorText}`);
        }
    } catch (error) {
        console.error('Submission failed:', error);

        if (error.name === 'AbortError') {
            alert('The Telegram request timed out. Please check your internet connection and Telegram bot settings, then try again.');
        } else {
            alert('There was an error submitting your data. Please check your Telegram bot token and chat ID, then try again.');
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Data';
    }
});