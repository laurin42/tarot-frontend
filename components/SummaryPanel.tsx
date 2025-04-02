import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { componentStyles, textStyles } from "@/styles";

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
    return <Text style={textStyles.errorText}>{error}</Text>;
  }

  return (
    <View style={componentStyles.summaryContainer}>
      <Text style={textStyles.summaryText}>{summary}</Text>

      {showButton && (
        <TouchableOpacity
          style={componentStyles.buttonFullWidth}
          onPress={onButtonPress}
        >
          <Text style={textStyles.buttonText}>Neue Legung beginnen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SummaryPanel;
