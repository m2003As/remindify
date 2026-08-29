import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "../lib/i18n";
import { GREET_ACTION, registerCategories } from "../lib/notifications";
import { theme } from "../lib/theme";

const APP_NAME = "riMind";

/** Gives the router a moment to mount before we navigate from a cold start. */
const NAVIGATE_DELAY_MS = 300;

export default function RootLayout() {
    const router = useRouter();
    const t = useTranslation();
    const handledId = useRef<string | null>(null);
    const response = Notifications.useLastNotificationResponse();

    useEffect(() => {
        registerCategories();
    }, []);

    useEffect(() => {
        if (!response) return;

        const request = response.notification.request;
        const reminderId = request.content.data?.reminderId as string | undefined;
        if (!reminderId || handledId.current === request.identifier) return;

        handledId.current = request.identifier;
        const greet = response.actionIdentifier === GREET_ACTION ? "1" : undefined;
        const timer = setTimeout(
            () => router.push({ pathname: "/reminder/[id]", params: { id: reminderId, greet } }),
            NAVIGATE_DELAY_MS,
        );

        return () => clearTimeout(timer);
    }, [response]);

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: theme.bg },
                    headerTintColor: theme.accent,
                    headerTitleStyle: { color: theme.text, fontWeight: "700" },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: theme.bg },
                    // Show just the chevron; otherwise iOS labels it with the previous route name.
                    headerBackButtonDisplayMode: "minimal",
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false, title: APP_NAME }} />
                <Stack.Screen name="reminder/new" options={{ title: t.form.newTitle, presentation: "modal" }} />
                <Stack.Screen name="reminder/[id]/index" options={{ title: "" }} />
                <Stack.Screen name="reminder/[id]/edit" options={{ title: t.form.editTitle, presentation: "modal" }} />
                <Stack.Screen
                    name="reminder/import"
                    options={{ title: t.settings.importBirthdays, presentation: "modal" }}
                />
                <Stack.Screen name="month/[month]" options={{ title: "" }} />
                <Stack.Screen name="settings" options={{ title: t.settings.title }} />
            </Stack>
        </>
    );
}
