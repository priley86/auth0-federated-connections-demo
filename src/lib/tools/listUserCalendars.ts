import { auth0 } from "@/lib/auth0"; // Same as your setup
import { tool } from "ai";
import { z } from "zod";
import { google } from "googleapis";

export const listUserCalendars = tool({
  description: 'List all calendars the user has access to',
  parameters: z.object({}),
  execute: async () => {
    const { token } = await auth0.getAccessTokenForConnection({
      connection: 'google-oauth2'
    });

    const calendar = google.calendar("v3");
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const res = await calendar.calendarList.list({ auth });
    return res.data.items?.map(cal => ({
      id: cal.id,
      name: cal.summary,
      accessRole: cal.accessRole,
    })) ?? [];
  }
});
