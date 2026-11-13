import { google } from "googleapis";

export interface LeadData {
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  designation?: string;
  website?: string;
  message?: string;
}

export async function appendLeadToSheet(data: LeadData) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Missing Google Sheets credentials in environment variables");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Format timestamp in IST
  const timestamp = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  // Store phone as text (prefixed with ') so it's always left-aligned and never drops leading digits or errors on +
  const cleanPhone = (data.phone || "").trim();
  const safePhone = cleanPhone ? (cleanPhone.startsWith("'") ? cleanPhone : `'${cleanPhone}`) : "";

  // Exact 8-column layout matching Google Sheet:
  // Col A: Timestamp
  // Col B: Full Name
  // Col C: Phone Number
  // Col D: Email
  // Col E: Company
  // Col F: Designation
  // Col G: Website
  // Col H: Message
  const values = [
    [
      timestamp,
      (data.fullName || "").trim(),
      safePhone,
      (data.email || "").trim(),
      (data.company || "").trim(),
      (data.designation || "").trim(),
      (data.website || "").trim(),
      (data.message || "").trim(),
    ],
  ];

  // Single fast append call: appends row with USER_ENTERED values across A:H
  const appendResponse = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:H`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values,
    },
  });

  // Fast single-pass formatting in parallel or non-blocking
  const updatedRange = appendResponse.data.updates?.updatedRange;
  if (updatedRange) {
    const match = updatedRange.match(/!A(\d+):[A-Z](\d+)/);
    if (match) {
      const startRow = parseInt(match[1], 10) - 1;
      const endRow = parseInt(match[2], 10);

      // Sheet1 has sheetId = 0
      sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: startRow,
                  endRowIndex: endRow,
                  startColumnIndex: 0,
                  endColumnIndex: 8,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: false,
                      fontSize: 11,
                    },
                    horizontalAlignment: "LEFT",
                  },
                },
                fields: "userEnteredFormat.textFormat.bold,userEnteredFormat.textFormat.fontSize,userEnteredFormat.horizontalAlignment",
              },
            },
          ],
        },
      }).catch((e) => console.error("Formatting background error:", e));
    }
  }

  return appendResponse.data;
}
