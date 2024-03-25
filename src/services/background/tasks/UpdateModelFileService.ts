import NetInfo from "@react-native-community/netinfo";

const updateModelFileService = async () => {
  const state = await NetInfo.fetch();

  if (state.isConnected) {
    // Download a new model
    // Delete local model file
    // Save new model file
  }
};

export { updateModelFileService };
