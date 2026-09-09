export async function performSarvamOCR(fileBuffer, mimeType) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      console.error("Server misconfiguration: missing SARVAM_API_KEY");
      return null;
    }

    // 1. Get Upload URL
    const uploadRes = await fetch("https://api.sarvam.ai/doc-ai/v1/job/upload", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content_type: mimeType })
    });

    if (!uploadRes.ok) {
      console.error("Failed to get upload URL:", await uploadRes.text());
      return null;
    }

    const uploadData = await uploadRes.json();
    const { upload_id, method, url } = uploadData;

    // 2. Upload the file
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
        "x-ms-blob-type": "BlockBlob"
      },
      body: fileBuffer
    });

    if (!putRes.ok) {
      console.error("Failed to upload file to Sarvam:", await putRes.text());
      return null;
    }

    // 3. Start the Digitisation Job
    const formData = new FormData();
    formData.append("upload_ids", upload_id);
    formData.append("language", "en-IN");
    formData.append("output_format", "md");

    const startRes = await fetch("https://api.sarvam.ai/doc-ai/v1/job/digitise", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey
      },
      body: formData
    });

    if (!startRes.ok) {
      console.error("Failed to start digitisation:", await startRes.text());
      return null;
    }

    const startData = await startRes.json();
    const jobId = startData.job_id;

    // 4. Poll for completion
    let jobStatus = "pending";
    const maxAttempts = 30; // Max 60 seconds (2s interval)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      const statusRes = await fetch(`https://api.sarvam.ai/doc-ai/v1/job/${jobId}/status`, {
        method: "GET",
        headers: { "api-subscription-key": apiKey }
      });

      if (!statusRes.ok) continue;

      const statusData = await statusRes.json();
      jobStatus = statusData.status?.toLowerCase() || jobStatus;
      console.log(`[OCR Polling] Job ID: ${jobId} | Attempt: ${attempts} | Status: ${jobStatus}`);

      if (["completed", "failed", "rejected", "partially_completed"].includes(jobStatus)) {
        break;
      }
    }

    if (jobStatus !== "completed" && jobStatus !== "partially_completed") {
      console.error(`OCR job failed or timed out. Final status: ${jobStatus}`);
      return null;
    }

    // 5. Fetch Results
    const resultsRes = await fetch(`https://api.sarvam.ai/doc-ai/v1/job/${jobId}/results`, {
      method: "GET",
      headers: { "api-subscription-key": apiKey }
    });

    if (!resultsRes.ok) {
      console.error("Failed to get results:", await resultsRes.text());
      return null;
    }

    const resultsData = await resultsRes.json();
    console.log("OCR Result Output:", JSON.stringify(resultsData, null, 2));

    // Extract only the real text
    let rawText = "";

    // Recursive search for text fields
    function findText(obj) {
      if (typeof obj === 'string') return obj;
      if (typeof obj !== 'object' || obj === null) return '';

      // Check common fields where OCR text is stored
      if (obj.markdown && typeof obj.markdown === 'string') return obj.markdown;
      if (obj.document && typeof obj.document === 'string') return obj.document;
      if (obj.text && typeof obj.text === 'string') return obj.text;

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(findText).filter(Boolean).join('\n');
      }

      // Handle block structures
      if (Array.isArray(obj.blocks)) {
        return obj.blocks.map(b => findText(b)).filter(Boolean).join('\n\n');
      }

      // If we have an object with data or result
      if (obj.data) return findText(obj.data);
      if (obj.result) return findText(obj.result);

      // Otherwise, concatenate all text-like string values
      let parts = [];
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
          const val = findText(obj[key]);
          if (val) parts.push(val);
        } else if (typeof obj[key] === 'string' && obj[key].length > 15) {
          // Assume long strings are part of the content
          parts.push(obj[key]);
        }
      }
      return parts.join('\n\n');
    }

    rawText = findText(resultsData);

    return rawText || resultsData;

  } catch (error) {
    console.error("OCR API Error:", error);
    return null;
  }
}
