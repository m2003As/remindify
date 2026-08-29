import * as FileSystem from "expo-file-system/legacy";

/**
 * Copies a picked or contact photo into app storage, so it survives the
 * original being deleted from the camera roll or contact card.
 * Returns null if the copy fails.
 */
export async function savePhoto(uri: string, prefix = "photo"): Promise<string | null> {
    try {
        const extension = uri.split(".").pop()?.split("?")[0] || "jpg";
        const destination = `${FileSystem.documentDirectory}${prefix}-${Date.now()}.${extension}`;
        await FileSystem.copyAsync({ from: uri, to: destination });
        return destination;
    } catch {
        return null;
    }
}
