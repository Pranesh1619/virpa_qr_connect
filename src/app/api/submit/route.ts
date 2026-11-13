import { NextRequest, NextResponse } from "next/server";
import { appendLeadToSheet } from "@/lib/googleSheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, company, designation, website, message, notes, address } = body;

    // Validate required fields (Either Full Name or Company, plus Phone)
    const effectiveName = (fullName || company || "").trim();
    if (!effectiveName || !phone) {
      return NextResponse.json(
        { error: "Contact Name or Company, and Phone Number are required." },
        { status: 400 }
      );
    }

    // Consolidated notes/address if passed separately
    const extraParts = [];
    if (message && message.trim()) extraParts.push(message.trim());
    if (notes && notes.trim()) extraParts.push(`Notes: ${notes.trim()}`);
    if (address && address.trim()) extraParts.push(`Address: ${address.trim()}`);

    await appendLeadToSheet({
      fullName: fullName ? fullName.trim() : (company ? company.trim() : "Lead"),
      phone,
      email: email || "",
      company: company || "",
      designation: designation || "",
      website: website || "",
      message: extraParts.join(" | "),
    });

    return NextResponse.json({
      success: true,
      message: "Lead saved successfully to Google Sheets!",
    });
  } catch (error: any) {
    console.error("Error writing to Google Sheets:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to save lead. Please check configuration.",
      },
      { status: 500 }
    );
  }
}
