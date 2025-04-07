import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link } from "expo-router";

const ZODIAC_SIGNS = [
  "Widder",
  "Stier",
  "Zwillinge",
  "Krebs",
  "Löwe",
  "Jungfrau",
  "Waage",
  "Skorpion",
  "Schütze",
  "Steinbock",
  "Wassermann",
  "Fische",
];

export default function ProfileScreen() {
  const { user, updateGoals } = useUser();
  const { signOut, isAuthenticated, isGuest } = useAuth();

  // Existing state
  const [goals, setGoals] = useState(user?.goals || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // New profile fields
  const [gender, setGender] = useState(user?.gender || "");
  const [zodiacSign, setZodiacSign] = useState(user?.zodiacSign || "");
  const [birthday, setBirthday] = useState(
    user?.birthday ? new Date(user.birthday) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate age based on birthday
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (user?.goals !== undefined) {
      setGoals(user.goals);
    }
    if (user?.gender) setGender(user.gender);
    if (user?.zodiacSign) setZodiacSign(user.zodiacSign);
    if (user?.birthday) setBirthday(new Date(user.birthday));
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Update with all profile fields
      await updateGoals(goals, {
        gender,
        zodiacSign,
        birthday: birthday.toISOString(),
      });

      setSuccess(true);
    } catch (error) {
      setError("Fehler beim Speichern des Profils");
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("Sign out button pressed");
    try {
      await signOut();
      console.log("Sign out completed successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert(
        "Fehler",
        "Abmelden fehlgeschlagen. Bitte versuche es erneut."
      );
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  if (isGuest) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Du bist als Gast unterwegs.</Text>
        <Link href={{ pathname: "/(auth)" }}>
          <Text style={{ color: "blue", marginTop: 10 }}>
            Anmelden oder Registrieren
          </Text>
        </Link>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Link href={{ pathname: "/(auth)" }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {user?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Persönliche Informationen</Text>

        {/* Gender Field */}
        <Text style={styles.fieldLabel}>Geschlecht</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            style={styles.picker}
            dropdownIconColor="#A78BFA"
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="Auswählen..." value="" />
            <Picker.Item label="Männlich" value="m" />
            <Picker.Item label="Weiblich" value="w" />
            <Picker.Item label="Divers" value="d" />
          </Picker>
        </View>

        {/* Zodiac Sign Field */}
        <Text style={styles.fieldLabel}>Sternzeichen</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={zodiacSign}
            style={styles.picker}
            dropdownIconColor="#A78BFA"
            onValueChange={(itemValue) => setZodiacSign(itemValue)}
          >
            <Picker.Item label="Auswählen..." value="" />
            {ZODIAC_SIGNS.map((sign) => (
              <Picker.Item key={sign} label={sign} value={sign} />
            ))}
          </Picker>
        </View>

        {/* Birthday Field */}
        <Text style={styles.fieldLabel}>Geburtstag</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {birthday.toLocaleDateString("de-DE")}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthday}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Age Display */}
        <Text style={styles.fieldLabel}>Alter</Text>
        <Text style={styles.ageDisplay}>{calculateAge(birthday)} Jahre</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meine Ziele</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Beschreibe deine Ziele für deine Tarot-Deutungen..."
          placeholderTextColor="#9CA3AF"
          value={goals}
          onChangeText={setGoals}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && (
          <Text style={styles.successText}>
            Profil erfolgreich gespeichert!
          </Text>
        )}

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Wird gespeichert..." : "Speichern"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.savedReadingsSection}>
        <Text style={styles.sectionTitle}>Gespeicherte Deutungen</Text>
        <View style={styles.noReadingsBox}>
          <Text style={styles.noReadingsText}>
            Keine gespeicherten Deutungen vorhanden
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Text style={styles.signOutText}>Abmelden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.98)", // Dark background matching app theme
  },
  headerBackground: {
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167, 139, 250, 0.3)", // Subtle purple border
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#A78BFA", // Purple border
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#A78BFA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profilePlaceholderText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  email: {
    fontSize: 14,
    color: "#9CA3AF", // Light gray
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167, 139, 250, 0.2)", // Subtle purple border
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#A78BFA", // Purple text
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#D1D5DB", // Light gray
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.3)",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
  },
  picker: {
    color: "#FFFFFF",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.3)",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    marginBottom: 16,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  ageDisplay: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.3)",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 15,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    color: "#FFFFFF",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "rgba(249, 115, 22, 0.9)", // Orange button like elsewhere in app
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#F87171", // Red
    marginBottom: 10,
  },
  successText: {
    color: "#6EE7B7", // Green
    marginBottom: 10,
  },
  savedReadingsSection: {
    padding: 20,
  },
  noReadingsBox: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.3)",
    borderRadius: 8,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  noReadingsText: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  signOutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "rgba(239, 68, 68, 0.8)", // Slightly translucent red
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
