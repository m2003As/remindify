import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "../lib/i18n";
import { styles, theme } from "../lib/theme";

export default function NotFoundScreen() {
    const t = useTranslation();

    return (
        <>
            <Stack.Screen options={{ title: t.notFound.title }} />
            <View style={[styles.screen, { alignItems: "center", justifyContent: "center", padding: 20 }]}>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>{t.notFound.body}</Text>
                <Link href="/" style={{ marginTop: 16, paddingVertical: 12 }}>
                    <Text style={{ color: theme.accent, fontSize: 15, fontWeight: "600" }}>{t.notFound.goHome}</Text>
                </Link>
            </View>
        </>
    );
}
