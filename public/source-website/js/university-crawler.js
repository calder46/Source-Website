// public/source-website/js/university-crawler.js

const GEMINI_STORAGE_KEY = "fasttrak_gemini_api_key";

function getGeminiApiKey() {
  let key = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (!key) {
    key = prompt(
      "Enter your Google Gemini API key to search live university course catalogs (stored locally in your browser):"
    );
    if (key && key.trim()) {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    }
  }
  return key ? key.trim() : null;
}

function clearGeminiApiKey() {
  localStorage.removeItem(GEMINI_STORAGE_KEY);
  alert("Saved API key cleared.");
}

async function searchUniversityCourses(libertyCourseCode, libertyCourseTitle) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("No API key provided.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const promptText = `
Search official university course catalogs (.edu websites, excluding liberty.edu) for existing course offerings equivalent to:
Liberty University Course: ${libertyCourseCode} - ${libertyCourseTitle}

Find 3 to 5 real courses from accredited universities or community colleges (such as Virginia Tech, NOVA, George Mason, JMU, UVA, etc.).
Return ONLY a valid JSON array with no markdown formatting. Each object must follow this exact schema:
[
  {
    "institution": "University Name",
    "courseCode": "e.g., ITE 152",
    "courseTitle": "Official Course Title",
    "credits": 3,
    "description": "Brief catalog description",
    "prerequisites": "Listed prerequisites or None",
    "catalogUrl": "Direct .edu URL found",
    "status": "Needs Official Verification"
  }
]
`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      tools: [{ google_search: {} }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const cleanedJson = rawText.replace(/```json|```/gi, "").trim();
  return JSON.parse(cleanedJson);
}
