import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import {
  onAuthChange,
  signInWithAppleCredential,
  signInWithGoogleCredential,
  signOut,
  performFullSync,
  upsertTaskToCloud,
} from "./firebase";
import {
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  Task,
} from "./store";
import type { User } from "firebase/auth";

interface SyncContextValue {
  firebaseUser: User | null;
  isSyncing: boolean;
  signInApple: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  syncSingleTask: (task: Task) => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

// Google OAuth Web Client ID — for Expo Go / web auth flow
// Users will need to set this up in Google Cloud Console for production
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Apple Sign-In
  const signInApple = useCallback(async () => {
    try {
      if (Platform.OS !== "ios") {
        Alert.alert("Apple Sign-In", "Apple Sign-In is only available on iOS devices.");
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("Sign-In Error", "No identity token received from Apple.");
        return;
      }

      const user = await signInWithAppleCredential(credential.identityToken);
      setFirebaseUser(user);

      // Update settings
      const settings = await loadSettings();
      await saveSettings({
        ...settings,
        syncEnabled: true,
        syncProvider: "apple",
        firebaseUserId: user.uid,
      });

      // Run initial sync
      await runSync(user.uid);
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User canceled — do nothing
        return;
      }
      console.error("Apple sign-in error:", e);
      Alert.alert("Sign-In Error", "Could not sign in with Apple. Please try again.");
    }
  }, []);

  // Google Sign-In
  const signInGoogle = useCallback(async () => {
    try {
      if (!GOOGLE_WEB_CLIENT_ID) {
        Alert.alert(
          "Google Sign-In",
          "Google Sign-In requires a Web Client ID. Please configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment."
        );
        return;
      }

      // Use AuthSession for Google sign-in (works in Expo Go)
      const redirectUri = AuthSession.makeRedirectUri({ scheme: "manus20260223191501" });
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36)
      );

      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
      };

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_WEB_CLIENT_ID,
        redirectUri,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: { nonce },
      });

      const result = await request.promptAsync(discovery);

      if (result.type === "success" && result.params?.id_token) {
        const user = await signInWithGoogleCredential(result.params.id_token);
        setFirebaseUser(user);

        const settings = await loadSettings();
        await saveSettings({
          ...settings,
          syncEnabled: true,
          syncProvider: "google",
          firebaseUserId: user.uid,
        });

        await runSync(user.uid);
      } else if (result.type === "cancel") {
        // User canceled
        return;
      }
    } catch (e: any) {
      console.error("Google sign-in error:", e);
      Alert.alert("Sign-In Error", "Could not sign in with Google. Please try again.");
    }
  }, []);

  // Sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setFirebaseUser(null);

      const settings = await loadSettings();
      await saveSettings({
        ...settings,
        syncEnabled: false,
        syncProvider: null,
        firebaseUserId: null,
      });
    } catch (e) {
      console.error("Sign-out error:", e);
    }
  }, []);

  // Full sync
  const runSync = useCallback(async (uid: string) => {
    setIsSyncing(true);
    try {
      const localTasks = await loadTasks();
      const merged = await performFullSync(uid, localTasks);
      await saveTasks(merged);

      const settings = await loadSettings();
      await saveSettings({
        ...settings,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error("Sync error:", e);
      Alert.alert("Sync Error", "Could not sync with cloud. Please try again later.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Manual sync now
  const syncNow = useCallback(async () => {
    const settings = await loadSettings();
    if (!settings.syncEnabled || !settings.firebaseUserId) {
      Alert.alert("Sync", "Please enable sync and sign in first.");
      return;
    }
    await runSync(settings.firebaseUserId);
  }, [runSync]);

  // Sync a single task (called after task create/update/complete)
  const syncSingleTask = useCallback(async (task: Task) => {
    try {
      const settings = await loadSettings();
      if (!settings.syncEnabled || !settings.firebaseUserId) return;
      await upsertTaskToCloud(settings.firebaseUserId, task);
    } catch (e) {
      // Silent fail for single task sync — will be caught by next full sync
      console.error("Single task sync error:", e);
    }
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      isSyncing,
      signInApple,
      signInGoogle,
      handleSignOut,
      syncNow,
      syncSingleTask,
    }),
    [firebaseUser, isSyncing, signInApple, signInGoogle, handleSignOut, syncNow, syncSingleTask]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return ctx;
}
