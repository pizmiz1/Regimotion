import { FlatList, LayoutAnimation, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../constants/colors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalContext } from "../../store/GlobalContext";
import { ExerciseDto, ModuleDto } from "../../../shared/moduledto";
import { MaterialIcons } from "@expo/vector-icons";
import { JsonDto } from "../../../shared/jsondto";
import { post } from "../../helpers/fetch";
import { errorAlert } from "../../helpers/alert";
import { LinkExercisesDto } from "../../../shared/linkexercisesdto";

// Custom Components
import Input from "../shared/Input";
import { MaterialIconButton } from "../shared/IconButton";
import Button from "../shared/Button";

interface LinkModalProps {
  visible: boolean;
  setVisible: (newVisible: boolean) => void;
  onFinish: () => void;
  exerciseId: string;
}

const LinkModal = ({ visible, setVisible, onFinish, exerciseId }: LinkModalProps) => {
  const { modules, accessToken, updateAccessToken, updateModules } = useGlobalContext();
  const allExercises = useMemo(() => modules.flatMap((module) => module.exercises), [modules]);
  const exercise = allExercises.find((item) => item.id === exerciseId);
  const initialSelectedIds = useMemo(() => {
    if (!exercise?.linkId) return [exerciseId];

    return [exerciseId, ...allExercises.filter((item) => item.linkId === exercise.linkId && item.id !== exerciseId).map((item) => item.id!)];
  }, [allExercises, exerciseId, exercise?.linkId]);
  const selectableExercises = allExercises.filter((exercise) => exercise.id !== exerciseId);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [saving, setSaving] = useState(false);

  const selectedExercises = useMemo(
    () =>
      selectedIds.flatMap((id) => {
        const exercise = allExercises.find((exercise) => exercise.id === id);
        return exercise ? [exercise] : [];
      }),
    [allExercises, selectedIds],
  );

  const displayedExercises = useMemo(() => {
    const exercises = selectableExercises;
    if (!search.trim()) return exercises;

    const cleanSearch = search.toLowerCase();
    return exercises.filter((ex) => ex.name?.toLowerCase().includes(cleanSearch));
  }, [selectableExercises, search]);

  const selectExercise = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIds((prevIds) => (prevIds.includes(id) ? prevIds.filter((item) => item !== id) : [...prevIds, id]));
  }, []);

  const save = async () => {
    setSaving(true);

    let body: LinkExercisesDto;
    let url: string;

    if (selectedIds.length === 1) {
      body = {
        exerciseIds: [exerciseId],
      };
      url = "/module/unlinkExercises";
    } else {
      body = {
        exerciseIds: selectedIds,
      };
      url = "/module/linkExercises";
    }

    const response: JsonDto<ModuleDto[]> = await post(url, body, {
      accessToken: accessToken,
      updateAccessToken: updateAccessToken,
    });

    if (response.error) {
      errorAlert(response.error);
      setSaving(false);
      return;
    }

    if (!response.data) {
      errorAlert("Bad Response");
      setSaving(false);
      return;
    }

    updateModules(response.data);
    closeModal();
  };

  const resetState = () => {
    if (search === "") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSearch("");
    setSelectedIds(initialSelectedIds);
  };

  const closeModal = () => {
    setVisible(false);
    setSaving(false);
    onFinish();
    resetState();
  };

  useEffect(() => {
    if (visible) {
      setSearch("");
      setSelectedIds(initialSelectedIds);
    }
  }, [visible, initialSelectedIds]);

  const renderChip = ({ item }: { item: ExerciseDto }) => {
    return (
      <View style={[styles.chipContainer, { opacity: saving ? 0.4 : 1 }]}>
        <Text style={styles.chipText}>{item.name}</Text>
        {exerciseId !== item.id && (
          <MaterialIconButton
            name="close"
            color="white"
            size={22}
            onPress={() => {
              selectExercise(item.id!);
            }}
            style={styles.chipBtn}
            disabled={saving}
          />
        )}
      </View>
    );
  };

  const renderSelection = ({ item }: { item: ExerciseDto }) => {
    return selectedIds.includes(item.id!) ? (
      <TouchableOpacity
        style={[styles.selectedContainer, { opacity: saving ? 0.4 : 1 }]}
        onPress={() => {
          selectExercise(item.id!);
        }}
        disabled={saving}
      >
        <Text style={styles.selectedText} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.selectedIconContainer}>
          <MaterialIcons name="check" color="white" size={18} />
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles.unselectedContainer, { opacity: saving ? 0.4 : 1 }]}
        onPress={() => {
          selectExercise(item.id!);
        }}
        disabled={saving}
      >
        <Text style={styles.unselectedText} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.unselectedIconContainer}>
          <MaterialIcons name="check" color="white" size={20} style={styles.unselectedIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.container}>
        <View style={styles.sheetContainer}>
          <View style={styles.headerContainer}>
            <MaterialIconButton
              name="close"
              color={colors.light_grey}
              size={24}
              onPress={() => {}}
              style={[styles.headerBtn, { opacity: 0 }]}
              disabled={true}
            />
            <Text style={styles.headerText}>Link Exercise</Text>
            <MaterialIconButton
              name="close"
              color={colors.light_grey}
              size={24}
              onPress={closeModal}
              style={[styles.headerBtn, { opacity: saving ? 0.4 : 1 }]}
              disabled={saving}
            />
          </View>

          <Input
            value={search}
            setValue={setSearch}
            baseBorderColor={colors.light_secondary}
            placeholder="Search exercises..."
            iconName="search"
            style={styles.search}
            clearable={true}
            disabled={saving}
          />

          <View style={{ overflow: "hidden" }}>
            <FlatList
              style={styles.chipListContainer}
              contentContainerStyle={styles.chipListContent}
              data={selectedExercises}
              renderItem={renderChip}
              keyExtractor={(curr) => curr.id!}
              horizontal={true}
            />
          </View>

          <FlatList
            style={styles.selectionListContainer}
            contentContainerStyle={styles.selectionListContent}
            data={displayedExercises}
            renderItem={renderSelection}
            keyExtractor={(curr) => curr.id!}
          />

          <View style={styles.btnContainer}>
            <Button label="Reset" onPress={resetState} disabled={(search === "" && selectedIds.length === 1) || saving} style={styles.btn} />
            <Button label={saving ? "Saving..." : "Save"} onPress={save} disabled={saving} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LinkModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#191d26",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: "white",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerBtn: {
    paddingVertical: "3%",
    paddingHorizontal: "1%",
  },
  search: {
    marginTop: 5,
  },
  btnContainer: {
    alignItems: "flex-end",
    flexGrow: 1,
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
  btn: {
    backgroundColor: colors.dark_grey,
  },
  chipContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    height: 35,
    borderRadius: 20,
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    color: "white",
    fontSize: 14,
  },
  chipBtn: {
    marginRight: -4,
  },
  selectedContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "97%",
    backgroundColor: "#191d26",
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  selectedText: {
    color: "white",
    fontSize: 16.5,
    width: "90%",
  },
  selectedIconContainer: {
    backgroundColor: colors.primary,
    padding: 4,
    borderRadius: 6,
  },
  unselectedContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "97%",
    backgroundColor: "#191d26",
    borderColor: colors.medium_grey,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  unselectedText: {
    color: colors.light_grey,
    fontSize: 16.5,
    width: "90%",
  },
  unselectedIconContainer: {
    borderColor: colors.medium_grey,
    borderWidth: 1.5,
    padding: 2,
    borderRadius: 6,
  },
  unselectedIcon: {
    opacity: 0,
  },
  chipListContainer: {
    flexGrow: 0,
    paddingBottom: 10,
  },
  chipListContent: {
    marginTop: 20,
    gap: 10,
  },
  selectionListContainer: {
    flexGrow: 0,
    marginTop: 20,
    maxHeight: 270,
  },
  selectionListContent: {
    gap: 15,
  },
});
