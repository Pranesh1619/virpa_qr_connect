import { NextRequest, NextResponse } from "next/server";
import { appendLeadToSheet } from "@/lib/googleSheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, company, designation, website, message, notes, address, originalPhone } = body;

    // Validate required fields (Either Full Name or Company, plus Phone)
    const effectiveName = (fullName || company || "").trim();
    if (!effectiveName || !phone) {
      return NextResponse.json(
        { error: "Contact Name or Company, and Phone Number are required." },
        { status: 400 }
      );
    }

    // Consolidated notes/address
    const extraParts = [];
    const noteText = (notes || message || "").trim();
    if (noteText) extraParts.push(noteText);
    if (address && address.trim()) extraParts.push(`Address: ${address.trim()}`);

    const result = await appendLeadToSheet({
      fullName: fullName ? fullName.trim() : (company ? company.trim() : "Lead"),
      phone,
      email: email || "",
      company: company || "",
      designation: designation || "",
      website: website || "",
      message: extraParts.join(" | "),
      originalPhone: originalPhone || "",
    });

    return NextResponse.json({
      success: true,
      updated: result?.updated || false,
      message: result?.updated
        ? "Lead updated successfully in Google Sheets!"
        : "Lead saved successfully to Google Sheets!",
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
