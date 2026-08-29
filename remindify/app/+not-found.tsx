import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { styles, theme } from "../lib/theme";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Not found" }} />
            <View style={[styles.screen, { alignItems: "center", justifyContent: "center", padding: 20 }]}>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>This screen doesn't exist.</Text>
                <Link href="/" style={{ marginTop: 16, paddingVertical: 12 }}>
                    <Text style={{ color: theme.accent, fontSize: 15, fontWeight: "600" }}>Go to the home screen</Text>
                </Link>
            </View>
        </>
    );
}
