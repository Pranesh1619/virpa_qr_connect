import { google } from "googleapis";

export interface LeadData {
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  designation?: string;
  website?: string;
  message?: string;
  originalPhone?: string;
}

function normalizePhone(p: string | undefined | null): string {
  if (!p) return "";
  const digits = String(p).replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export async function appendLeadToSheet(data: LeadData): Promise<{ updated: boolean; row?: number }> {
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

  // Check if contact already exists in sheet to update in place instead of creating a duplicate row
  let existingRowIndex = -1;
  let originalTimestamp = "";

  try {
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });

    const rows = getResponse.data.values || [];
    const targetPhone = normalizePhone(data.phone);
    const targetOriginalPhone = normalizePhone(data.originalPhone);
    const targetName = (data.fullName || "").trim().toLowerCase();
    const targetCompany = (data.company || "").trim().toLowerCase();

    // Skip row 0 (headers)
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const rowPhone = normalizePhone(row[2]);
      const rowName = String(row[1] || "").trim().toLowerCase();
      const rowCompany = String(row[4] || "").trim().toLowerCase();

      // Check by Phone (last 10 digits)
      const phoneMatches =
        rowPhone.length >= 7 &&
        ((targetPhone.length >= 7 && rowPhone === targetPhone) ||
          (targetOriginalPhone.length >= 7 && rowPhone === targetOriginalPhone));

      // Or check by Full Name + Company (if non-empty)
      const nameCompanyMatches =
        targetName.length > 2 &&
        rowName === targetName &&
        (targetCompany.length > 1 ? rowCompany === targetCompany : true);

      if (phoneMatches || nameCompanyMatches) {
        existingRowIndex = r;
        originalTimestamp = String(row[0] || "");
        break;
      }
    }
  } catch (err) {
    console.warn("Could not check existing rows, falling back to append:", err);
  }

  // Exact 8-column layout matching Google Sheet:
  // Col A: Timestamp (preserve original timestamp if updating)
  // Col B: Full Name
  // Col C: Phone Number
  // Col D: Email
  // Col E: Company
  // Col F: Designation
  // Col G: Website
  // Col H: Message
  const values = [
    [
      existingRowIndex >= 1 && originalTimestamp ? originalTimestamp : timestamp,
      (data.fullName || "").trim(),
      safePhone,
      (data.email || "").trim(),
      (data.company || "").trim(),
      (data.designation || "").trim(),
      (data.website || "").trim(),
      (data.message || "").trim(),
    ],
  ];

  if (existingRowIndex >= 1) {
    // UPDATE EXISTING ROW IN PLACE
    const rowNumber = existingRowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowNumber}:H${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    // Formatting in parallel
    sheets.spreadsheets
      .batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: existingRowIndex,
                  endRowIndex: existingRowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: 8,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: false,
                      fontSize: 10,
                      fontFamily: "Arial",
                    },
                    horizontalAlignment: "LEFT",
                    verticalAlignment: "MIDDLE",
                  },
                },
                fields: "userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)",
              },
            },
          ],
        },
      })
      .catch(() => {});

    return { updated: true, row: rowNumber };
  } else {
    // APPEND AS NEW ROW
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    const updatedRange = appendResponse.data.updates?.updatedRange;
    if (updatedRange) {
      const match = updatedRange.match(/!A(\d+):[A-Z](\d+)/);
      if (match) {
        const startRow = parseInt(match[1], 10) - 1;
        const endRow = parseInt(match[2], 10);

        sheets.spreadsheets
          .batchUpdate({
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
                          fontSize: 10,
                          fontFamily: "Arial",
                        },
                        horizontalAlignment: "LEFT",
                        verticalAlignment: "MIDDLE",
                      },
                    },
                    fields: "userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)",
                  },
                },
              ],
            },
          })
          .catch(() => {});
      }
    }

    return { updated: false };
  }
}
