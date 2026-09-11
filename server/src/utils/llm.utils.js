import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { env } from "../../config/env.js"; // Ensure env is loaded or process.env is used. Assuming env has GEMINI_API_KEY.

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are a medical data extraction assistant. Your task is to process raw OCR text from medical documents and extract structured information into an EXACT JSON format.

RULES:
1. NEVER invent a medical value.
2. NEVER invent a medication dose.
3. NEVER invent a diagnosis.
4. NEVER invent a date.
5. NEVER invent a reference range.
6. NEVER infer missing patient information.
7. NEVER convert an abnormal lab value directly into a diagnosis.
8. Only extract information supported by the supplied OCR text.
9. If information is unavailable, return null, [], or "unknown" as appropriate.
10. If information is ambiguous, flag it for verification.
11. If a value is not relevant for the particular input, do NOT remove the key, instead store null.

The required JSON structure:
{
  "document_id": null,
  "document_type": "prescription | laboratory_report | imaging_report | discharge_summary | clinical_note | investigation_report | other | unknown",
  "document_subtype": null, // e.g. "CBC", "Chest X-Ray"
  "document_date": null, // "YYYY-MM-DD"
  "patient": {
    "name": null,
    "age": null,
    "gender": null,
    "patient_id": null
  },
  "provider": {
    "doctor_name": null,
    "hospital_or_lab": null
  },
  "summary": {
    "overall_status": "normal | abnormal | critical | informational | uncertain",
    "clinical_summary": "Short physician-friendly summary",
    "key_findings": []
  },
  "clinical_data": {}, // Varies based on document type (see below)
  "document_quality": {
    "is_complete": true,
    "illegible_fields": [],
    "missing_information": []
  },
  "verification": {
    "requires_review": false,
    "fields_requiring_review": []
  }
}

Summary Rules:
- normal: values within reference ranges, no abnormality.
- abnormal: clinically relevant abnormal findings present.
- critical: explicit critical/urgent finding.
- informational: normal/abnormal doesn't apply (e.g. prescriptions).
- uncertain: incomplete, illegible, ambiguous.

Clinical Data Structures:

For laboratory_report:
"clinical_data": {
  "tests": [
    {
      "test_name": "", "value": null, "unit": null,
      "reference_range": { "low": null, "high": null, "text": null },
      "status": "normal | low | high | critical | positive | negative | abnormal | unknown",
      "abnormal": false, "source_text": "", "confidence": 0.0, "requires_verification": false
    }
  ]
}

For prescription:
"clinical_data": {
  "diagnoses": [{ "name": "", "certainty": "documented", "source_text": "" }],
  "medications": [{
    "name": "", "strength": null, "form": null, "route": null, "dose": null,
    "frequency": null, "timing": null, "duration": null, "instructions": null,
    "source_text": "", "confidence": 0.0, "requires_verification": false
  }]
}

For imaging_report:
"clinical_data": {
  "imaging": {
    "modality": null, "body_part": null,
    "findings": [{ "finding": "", "location": null, "status": "unknown", "source_text": "", "confidence": 0.0 }],
    "impression": null
  }
}

For discharge_summary:
"clinical_data": {
  "admission": { "admission_date": null, "discharge_date": null, "reason": null },
  "diagnoses": [],
  "procedures": [{ "name": "", "date": null, "source_text": "" }],
  "hospital_course": null,
  "medications_at_discharge": [],
  "follow_up": []
}

For clinical_note:
"clinical_data": {
  "chief_complaint": [],
  "history_of_present_illness": { "onset": null, "duration": null, "symptoms": [], "associated_symptoms": [], "aggravating_factors": [], "relieving_factors": [] },
  "past_medical_history": [], "medications": [], "allergies": [], "family_history": [], "social_history": [], "examination": [], "assessment": [], "plan": []
}

For other:
"clinical_data": {
  "extracted_information": [{ "field": "", "value": "", "source_text": "", "confidence": 0.0 }]
}
`;

export async function extractMedicalDataFromOCR(ocrText) {
  if (!ocrText || typeof ocrText !== "string" || !ocrText.trim()) {
    throw new Error("Invalid or empty OCR text provided");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Extract structured medical data from the following OCR text:\n\n${ocrText}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    const structuredData = JSON.parse(responseText);
    return structuredData;
  } catch (error) {
    console.error("Error in extractMedicalDataFromOCR:", error);
    throw error;
  }
}

export async function summarizeReportForCase(caseSummary, ocrText) {
  if (!ocrText || typeof ocrText !== "string" || !ocrText.trim()) {
    throw new Error("Invalid or empty OCR text provided");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are a medical document summarization assistant. Compare the uploaded report OCR with the patient case summary below.

Safety rules:
- Use only facts explicitly present in the case summary or OCR.
- Do not diagnose, prescribe treatment, or claim that the report caused a symptom.
- Mark uncertain or illegible information as needing review.
- Keep the summary concise and clinician-friendly.

Return exactly this JSON shape:
{
  "report_type": "laboratory report | imaging report | prescription | discharge summary | clinical note | other | unknown",
  "overall_status": "normal | abnormal | critical | informational | uncertain",
  "clinical_summary": "Concise summary of the uploaded report",
  "key_findings": ["fact from the report"],
  "case_relevance": "How the documented findings relate to the supplied case, or 'No direct relationship documented.'",
  "requires_review": false
}

Patient case summary:
${caseSummary || "No case summary supplied."}

Uploaded report OCR:
${ocrText}`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error in summarizeReportForCase:", error);
    throw error;
  }
}
