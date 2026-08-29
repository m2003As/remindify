import { Platform, Share, Linking } from "react-native";
import { Reminder } from "./types";
import { iconFor, ageTurning } from "./dateUtils";

export function greetingFor(r: Reminder): string {
    if (r.type === "birthday") {
        return `Gratulerer med dagen, ${r.name}! 🎉`;
    }
    if (r.type === "anniversary") {
        return `Gratulerer med jubileet, ${r.name}! 💍`;
    }
    return `Tenker på deg i dag, ${r.name}! ${iconFor(r)}`;
}

export function greetingWithAge(r: Reminder): string {
    return `Gratulerer med ${ageTurning(r.date)}-årsdagen, ${r.name}! 🎉`;
}

export async function sendGreeting(text: string) {
    const sep = Platform.OS === "ios" ? "&" : "?";
    const url = `sms:${sep}body=${encodeURIComponent(text)}`;
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen) {
        await Linking.openURL(url);
    } else {
        await Share.share({ message: text });
    }
}