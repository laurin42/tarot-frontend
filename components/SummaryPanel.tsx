import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { commonStyles, globalTextStyles } from "@/styles/tarotTheme";

interface SummaryPanelProps {
  loading: boolean;
  error: string | null;
  summary: string;
  showButton: boolean;
  onButtonPress: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  loading,
  error,
  summary,
  showButton,
  onButtonPress,
}) => {
  if (loading) {
    return <ActivityIndicator size="large" color="#fff" />;
  }

  if (error) {
    return <Text style={globalTextStyles.errorText}>{error}</Text>;
  }

  return (
    <View style={commonStyles.summaryContainer}>
      <Text style={globalTextStyles.summaryText}>{summary}</Text>

      {showButton && (
        <TouchableOpacity
          style={commonStyles.buttonFullWidth}
          onPress={onButtonPress}
        >
          <Text style={globalTextStyles.buttonText}>Neue Legung beginnen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SummaryPanel;
