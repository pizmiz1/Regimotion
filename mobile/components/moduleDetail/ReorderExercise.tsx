import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScaleDecorator } from "react-native-draggable-flatlist";
import colors from "../../constants/colors";
import { ExerciseDto } from "../../../shared/moduledto";
import { MaterialIconButton } from "../shared/IconButton";

interface ReorderExerciseProps {
  item: ExerciseDto;
  drag: () => void;
  isActive: boolean;
  saving: boolean;
}

const ReorderExercise = ({ item, drag, isActive, saving }: ReorderExerciseProps) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive || saving}
        style={{
          paddingVertical: 15,
          flexDirection: "row",
          alignItems: "center",
          opacity: saving ? 0.6 : 1,
        }}
      >
        <MaterialIconButton name="reorder" color={colors.lightest_grey} size={25} onPress={() => {}} disabled={true} style={{ marginLeft: 12 }} />
        <View style={{ flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-between", marginLeft: 12 }}>
          <View style={{ justifyContent: "center", flex: 1, gap: 7, marginLeft: 15 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }} numberOfLines={1}>
              {item?.altActive ? item.altName : item?.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: colors.lightest_grey, width: "40%" }} numberOfLines={1}>
                {item?.altActive ? item.altText1 : item?.text1}
              </Text>
              <View
                style={{
                  width: StyleSheet.hairlineWidth,
                  backgroundColor: colors.border_grey,
                  height: 20,
                  marginHorizontal: 20,
                  opacity: item?.text2 ? 1 : 0,
                }}
              />
              {item?.text2 && (
                <Text style={{ color: colors.lightest_grey, width: "40%" }} numberOfLines={1}>
                  {item.altActive ? item.altText2 : item.text2}
                </Text>
              )}
            </View>
          </View>

          <View
            style={{
              opacity: item?.altActive === true ? 1 : 0,
              borderWidth: 1,
              borderColor: colors.primary,
              borderRadius: 20,
              marginTop: 5,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: "white", paddingHorizontal: 10, paddingVertical: 2 }}>Alt</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

export default ReorderExercise;
