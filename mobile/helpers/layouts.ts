import { LayoutAnimation } from "react-native";

export const opacityLayout = () => {
  LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.linear, LayoutAnimation.Properties.opacity));
};

export const opacityLayoutEaseOut = () => {
  LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeOut, LayoutAnimation.Properties.opacity));
};

export const scaleXYLayout = () => {
  LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.linear, LayoutAnimation.Properties.scaleXY));
};

export const scaleYLayout = () => {
  LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.linear, LayoutAnimation.Properties.scaleY));
};
