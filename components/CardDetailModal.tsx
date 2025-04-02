import React from "react";
import { View, Modal, Text, ScrollView, TouchableOpacity } from "react-native";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { commonStyles, globalTextStyles } from "@/styles/tarotTheme";

interface CardDetailModalProps {
  isVisible: boolean;
  card: ISelectedAndShownCard | null;
  onClose: () => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isVisible,
  card,
  onClose,
}) => {
  if (!card) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={commonStyles.modalOverlay}>
        <View style={commonStyles.modalContent}>
          <Text style={globalTextStyles.modalTitle}>{card.name}</Text>

          <ScrollView
            style={{ width: "100%", maxHeight: "80%", marginBottom: 0 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={true}
          >
            <Text style={globalTextStyles.modalText}>{card.explanation}</Text>
          </ScrollView>

          <TouchableOpacity
            style={{
              width: "100%",
              paddingVertical: 12,
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              borderTopWidth: 1,
              borderColor: "rgba(139, 92, 246, 0.3)",
              marginTop: 4,
              alignItems: "center",
            }}
            onPress={onClose}
          >
            <Text style={globalTextStyles.buttonText}>Schließen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CardDetailModal;
