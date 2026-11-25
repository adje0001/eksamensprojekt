// Start screen. Placeholder until the first mobile feature (login) is built.
// All data comes from the NestJS API (see CLAUDE.md, Architecture). No DB access here.
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat app</Text>
      <Text>Mobile client. Nothing to see yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
});
