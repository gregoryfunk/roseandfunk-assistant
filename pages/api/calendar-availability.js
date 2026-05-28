// pages/api/calendar-availability.js
// Fetches busy days for each designer from their project calendars
// Requires GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in Vercel env vars

export const config = { maxDuration: 30 };

const DESIGNER_CALENDARS = {
  chloe: [
    "c_7642b63030eb29a9702fc95b7e3bfad72bf0970dda247beefc956d596545473d@group.calendar.google.com", // Hadden Street
    "c_a72ec52341253877ab0fecd3650e48f428c424fa03d860b63d0924e1d7f73e20@group.calendar.google.com", // Connaught Drive
  ],
  stephanie: [
    "c_170cd1878e35041b170b3e0fa08ac082aea5c453e6bcc0a821f88df9911a6fcb@group.calendar.google.com", // Westmount
    "c_e83c86a02e383b3e6fcdbb9769d04613718faabd2a69ac3279144a2117f8ef49@group.calendar.google.com", // Shoemay
  ],
  lillian: [
    "c_a9532210de5e87857e824f761cce1905cc429abe1de30e458c9638b8247937a7@group.calendar.google.com", // McKee Road
    "c_4986132eaa55f4b64d13db81e5cec845d6ec686dc6eeeb2b3215c254e936ec2c@group.calendar.google.com", // Halfmoon Bay Furniture
  ],
};

// Also check the main info@ calendar for absences (Gregory away, Chloe away, Stephanie off, etc.)
const INFO_CALENDAR = "info@roseandfunk.com";

async function getGoogleAccessToken() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY env vars");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  // Base64url encode
  const base64url = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const signingInput = `${base64url(header)}.${base64url(payload)}`;

  // Sign with RS256 using the private key
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign
    .sign(privateKey, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${signingInput}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

async function fetchCalendarEvents(calendarId, timeMin, timeMax, accessToken) {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "500",
  });

  const encodedId = encodeURIComponent(calendarId);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    console.error(`Calendar fetch failed for ${calendarId}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

function eventToDateStrings(event) {
  // Returns array of YYYY-MM-DD strings this event covers
  const dates = [];
  if (event.start?.date) {
    // All-day event
    const start = new Date(event.start.date);
    const end = new Date(event.end.date);
    const cur = new Date(start);
    while (cur < end) {
      dates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  } else if (event.start?.dateTime) {
    // Timed event — just use the date portion
    dates.push(event.start.dateTime.slice(0, 10));
  }
  return dates;
}

function extractAbsences(events, designerName) {
  // Parse info@ calendar events that mention a designer or Gregory
  const absences = new Set();
  const keywords = {
    chloe: ["chloe"],
    stephanie: ["stephanie", "stephanien"],
    lillian: ["lillian"],
    gregory: ["gregory", "away", "vacation"],
  };

  for (const event of events) {
    const title = (event.summary || "").toLowerCase();
    const isAbsence =
      title.includes("away") ||
      title.includes(" off") ||
      title.includes("vacation") ||
      title.includes("holiday");

    if (!isAbsence) continue;

    const matchesDesigner = keywords[designerName]?.some((k) =>
      title.includes(k)
    );
    const isGregoryAbsence =
      keywords.gregory.some((k) => title.includes(k)) &&
      !title.includes("chloe") &&
      !title.includes("stephanie") &&
      !title.includes("lillian");

    if (matchesDesigner || (designerName === "gregory" && isGregoryAbsence)) {
      eventToDateStrings(event).forEach((d) => absences.add(d));
    }
  }
  return absences;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate required" });
  }

  try {
    const accessToken = await getGoogleAccessToken();

    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate).toISOString();

    // Fetch info@ calendar for absences
    const infoEvents = await fetchCalendarEvents(
      INFO_CALENDAR,
      timeMin,
      timeMax,
      accessToken
    );

    // Build Gregory's busy days from info@ calendar meetings
    const gregoryClinMeetings = new Set();
    for (const event of infoEvents) {
      const title = (event.summary || "").toLowerCase();
      // Gregory is away events
      if (
        (title.includes("gregory") || title.includes("away")) &&
        (title.includes("away") || title.includes("off") || title.includes("vacation"))
      ) {
        eventToDateStrings(event).forEach((d) => gregoryClinMeetings.add(d));
      }
    }

    // Fetch each designer's project calendars
    const designerBusyDays = {};

    for (const [designer, calendarIds] of Object.entries(DESIGNER_CALENDARS)) {
      const busyDays = new Set();

      // Add absences from info@ calendar
      const absences = extractAbsences(infoEvents, designer);
      absences.forEach((d) => busyDays.add(d));

      // Add booked design days from project calendars
      for (const calId of calendarIds) {
        const events = await fetchCalendarEvents(calId, timeMin, timeMax, accessToken);
        for (const event of events) {
          // Only count Design blocks (not client meetings — those are fine to schedule around)
          const title = (event.summary || "").toLowerCase();
          if (title.startsWith("design ")) {
            eventToDateStrings(event).forEach((d) => busyDays.add(d));
          }
        }
      }

      designerBusyDays[designer] = Array.from(busyDays).sort();
    }

    // Also pull client meetings from info@ to identify blocked meeting slots
    const clientMeetings = [];
    for (const event of infoEvents) {
      const title = event.summary || "";
      if (title.startsWith("RF ") || title.startsWith("Design ")) {
        clientMeetings.push({
          title,
          date: event.start?.date || event.start?.dateTime?.slice(0, 10),
          time: event.start?.dateTime
            ? new Date(event.start.dateTime).toLocaleTimeString("en-CA", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Vancouver",
              })
            : "all-day",
        });
      }
    }

    return res.status(200).json({
      designerBusyDays,
      gregorBusyDays: Array.from(gregoryClinMeetings).sort(),
      clientMeetings,
      fetchedFrom: startDate,
      fetchedTo: endDate,
    });
  } catch (err) {
    console.error("Calendar availability error:", err);
    return res.status(500).json({ error: err.message });
  }
}
