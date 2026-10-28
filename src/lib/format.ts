/** "26 October 2026": the same on server and client, whatever the time zone. */
export const formatDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
