import { tool } from "ai";
import { z } from "zod";
import { google } from "googleapis";
import { auth0 } from "@/lib/auth0";

/**
 * Tool: listCalendarEvents
 * Lists calendar events between a start and end time from a specified calendar.
 */
export const listNearbyEvents = tool({
  description: 'List calendar events between a given start and end time from a user’s calendar (personal or shared)',
  parameters: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
    calendarId: z.string().optional().default("primary"),
  }),
  execute: async ({ start, end, calendarId }) => {
    const { token } = await auth0.getAccessTokenForConnection({
      connection: 'google-oauth2'
    });

    const calendar = google.calendar("v3");
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    console.log(`Listing events between ${start.toISOString()} and ${end.toISOString()} for calendar ${calendarId}`);

    const response = await calendar.events.list({
      auth,
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });

    return {
      calendarId,
      events: response.data.items?.map(ev => ({
        id: ev.id,
        summary: ev.summary,
        start: ev.start?.dateTime ?? ev.start?.date,
        end: ev.end?.dateTime ?? ev.end?.date,
        location: ev.location ?? "No location",
      })) ?? [],
    };
  },
});