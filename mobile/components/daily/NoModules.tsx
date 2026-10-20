import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { ModuleDto } from "../../../shared/moduledto";

// Custom Components
import Module from "../shared/Module";
import Button from "../shared/Button";

interface NoModulesProps {
  addPress: () => void;
}

const NoModules = ({ addPress }: NoModulesProps) => {
  const fakeModule: ModuleDto = {
    id: "1",
    name: "",
    icon: "10k",
    color: "",
    days: { mon: false, tues: false, wed: false, thur: false, fri: false, sat: false, sun: false },
    progress: 0,
    exercises: [],
  };

  return (
    <View style={styles.container}>
      <View style={styles.moduleContainer}>
        <Module style={styles.module} disabled={true} blank={true} onPress={() => {}} module={fakeModule} />
        <Module style={styles.module} disabled={true} blank={true} onPress={() => {}} module={fakeModule} />
      </View>
      <Text style={styles.headerText}>No Modules</Text>
      <Text style={styles.descriptionText}>Add your first module to get started!</Text>
      <Button label="Add" style={styles.btn} onPress={addPress} />
    </View>
  );
};

export default NoModules;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: "30%",
  },
  moduleContainer: {
    flexDirection: "row",
    gap: 30,
    flexWrap: "wrap",
  },
  module: {
    opacity: 0.25,
  },
  headerText: {
    color: "white",
    fontSize: 40,
    marginTop: "10%",
    fontFamily: "Main-Font",
    fontStyle: "italic",
  },
  descriptionText: {
    width: "90%",
    marginTop: "5%",
    color: colors.lighter_grey,
    textAlign: "center",
  },
  btn: {
    marginTop: "10%",
  },
});
