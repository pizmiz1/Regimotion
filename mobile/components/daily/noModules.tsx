import { Text, View } from "react-native";
import Module from "../shared/module";
import colors from "../../constants/colors";
import Button from "../shared/button";

interface NoModulesProps {
  addPress: () => void;
}

const NoModules = ({ addPress }: NoModulesProps) => {
  return (
    <View style={{ alignItems: "center", marginTop: "30%" }}>
      <View style={{ flexDirection: "row", gap: 30, flexWrap: "wrap" }}>
        <Module
          style={{ opacity: 0.25 }}
          disabled={true}
          blank={true}
          onPress={() => {}}
          module={{
            id: "1",
            name: "",
            icon: "10k",
            color: "",
            days: { mon: false, tues: false, wed: false, thur: false, fri: false, sat: false, sun: false },
            progress: 0,
            exercises: [],
          }}
        />
        <Module
          style={{ opacity: 0.25 }}
          disabled={true}
          blank={true}
          onPress={() => {}}
          module={{
            id: "1",
            name: "",
            icon: "10k",
            color: "",
            days: { mon: false, tues: false, wed: false, thur: false, fri: false, sat: false, sun: false },
            progress: 0,
            exercises: [],
          }}
        />
      </View>
      <Text style={{ color: "white", fontSize: 40, marginTop: "10%", fontFamily: "Main-Font", fontStyle: "italic" }}>No modules</Text>
      <Text
        style={{
          width: "90%",
          marginTop: "5%",
          color: colors.lighter_grey,
          textAlign: "center",
        }}
      >
        Add your first module to get started!
      </Text>
      <Button label="Add" style={{ marginTop: "10%" }} onPress={addPress} />
    </View>
  );
};

export default NoModules;
