import { addHours, formatISO } from "date-fns";
import { GaxiosError } from "gaxios";
import { google } from "googleapis";
import { getAccessTokenForConnection } from "@auth0/ai-vercel";
import { FederatedConnectionError } from "@auth0/ai/interrupts";
import { withGoogleCalendar } from "@/lib/auth0-ai";
import { tool } from "ai";
import { z } from "zod";

export const checkUsersCalendar = withGoogleCalendar(
  tool({
    description:
      "Check user availability on a given date time on their calendar",
    parameters: z.object({
      date: z.coerce.date(),
    }),
    execute: async ({ date }) => {
      // Get the access token from Auth0 AI
      const accessToken = getAccessTokenForConnection();

      // Google SDK
      try {
        const calendar = google.calendar("v3");
        const auth = new google.auth.OAuth2();

        auth.setCredentials({
          access_token: accessToken,
        });

        const response = await calendar.freebusy.query({
          auth,
          requestBody: {
            timeMin: formatISO(date),
            timeMax: addHours(date, 1).toISOString(),
            timeZone: "UTC",
            items: [{ id: "primary" }],
          },
        });

        return {
          available: response.data?.calendars?.primary?.busy?.length === 0,
        };
      } catch (error) {
        if (error instanceof GaxiosError) {
          if (error.status === 401) {
            throw new FederatedConnectionError(
              `Authorization required to access the Federated Connection`
            );
          }
        }

        throw error;
      }
    },
  })
);