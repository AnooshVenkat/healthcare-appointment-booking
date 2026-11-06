import { format, parseISO } from "date-fns";

export function formatSlotLabel(iso: string) {
  return format(parseISO(iso), "EEE MMM d · h:mm a");
}
