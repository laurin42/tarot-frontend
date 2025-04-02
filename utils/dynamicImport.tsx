// In ErrorFallback.tsx
import React from "react";
import { Text, View } from "react-native";

const ErrorFallback = ({ message }: { message: string }) => {
  return (
    <View>
      <Text>{message}</Text>
    </View>
  );
};

// Add displayName
ErrorFallback.displayName = "ErrorFallback";

export default ErrorFallback;
