import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScaleDecorator } from "react-native-draggable-flatlist";
import colors from "../../constants/colors";
import { ExerciseDto } from "../../../shared/moduledto";

// Custom Components
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
      <TouchableOpacity onLongPress={drag} disabled={isActive || saving} style={[styles.container, { opacity: saving ? 0.6 : 1 }]}>
        <MaterialIconButton name="reorder" color={colors.lightest_grey} size={25} onPress={() => {}} disabled={true} style={styles.icon} />
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText} numberOfLines={1}>
              {item?.altActive ? item.altName : item?.name}
            </Text>
            <View style={styles.descriptionsContainer}>
              <Text style={styles.descriptionText} numberOfLines={1}>
                {item?.altActive ? item.altText1 : item?.text1}
              </Text>
              <View style={[styles.descriptionDivider, { opacity: item?.text2 ? 1 : 0 }]} />
              {item?.text2 && (
                <Text style={styles.descriptionText} numberOfLines={1}>
                  {item.altActive ? item.altText2 : item.text2}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.altContainer, { opacity: item?.altActive === true ? 1 : 0 }]}>
            <Text style={styles.altText}>Alt</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

export default ReorderExercise;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 12,
  },
  infoContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
    gap: 7,
    marginLeft: 15,
  },
  nameText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  descriptionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  descriptionText: {
    color: colors.lightest_grey,
    width: "40%",
  },
  descriptionDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border_grey,
    height: 20,
    marginHorizontal: 20,
  },
  altContainer: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    marginTop: 5,
    backgroundColor: colors.primary,
  },
  altText: {
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
});
