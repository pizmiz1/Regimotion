"use client";

import { SvgIconProps } from "@mui/material";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import SportsHockeyIcon from "@mui/icons-material/SportsHockey";
import WaterIcon from "@mui/icons-material/Water";
import GrassIcon from "@mui/icons-material/Grass";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PetsIcon from "@mui/icons-material/Pets";
import PersonalInjuryIcon from "@mui/icons-material/PersonalInjury";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import StreamIcon from "@mui/icons-material/Stream";
import StarIcon from "@mui/icons-material/Star";
import CloudIcon from "@mui/icons-material/Cloud";
import CameraIcon from "@mui/icons-material/Camera";
import ThreeSixtyIcon from "@mui/icons-material/ThreeSixty";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ApiIcon from "@mui/icons-material/Api";
import { useEffect, useState } from "react";
import { iconList } from "@/constants/maps";

const getIconComponent = (key: (typeof iconList)[number]) => {
  switch (key) {
    case "fitness-center":
      return FitnessCenterIcon;
    case "directions-bike":
      return DirectionsBikeIcon;
    case "directions-run":
      return DirectionsRunIcon;
    case "sports-soccer":
      return SportsSoccerIcon;
    case "sports-basketball":
      return SportsBasketballIcon;
    case "sports-volleyball":
      return SportsVolleyballIcon;
    case "sports-hockey":
      return SportsHockeyIcon;
    case "water":
      return WaterIcon;
    case "eco":
      return GrassIcon;
    case "landscape":
      return LandscapeIcon;
    case "pets":
      return PetsIcon;
    case "personal-injury":
      return PersonalInjuryIcon;
    case "sentiment-very-satisfied":
      return SentimentVerySatisfiedIcon;
    case "local-hospital":
      return LocalHospitalIcon;
    case "medical-services":
      return MedicalServicesIcon;
    case "health-and-safety":
      return HealthAndSafetyIcon;
    case "accessibility":
      return AccessibilityIcon;
    case "stream":
      return StreamIcon;
    case "star":
      return StarIcon;
    case "cloud":
      return CloudIcon;
    case "camera":
      return CameraIcon;
    case "360":
      return ThreeSixtyIcon;
    case "all-inclusive":
      return AllInclusiveIcon;
    case "api":
      return ApiIcon;
    default:
      return () => null;
  }
};

const displayIconMap = Object.fromEntries(iconList.map((key) => [key, getIconComponent(key)]));

type IconName = keyof typeof displayIconMap;

const FallbackIcon = FitnessCenterIcon;

interface MatIconProps extends SvgIconProps {
  name: string;
}

const MatIcon = ({ name, ...props }: MatIconProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration error
  if (!mounted) {
    return <span style={{ display: "inline-block", width: "24px", height: "24px" }} />;
  }

  const safeKey = name?.toLowerCase() as IconName;
  const IconComponent = displayIconMap[safeKey] || FallbackIcon;
  return <IconComponent {...props} suppressHydrationWarning />;
};

export default MatIcon;
