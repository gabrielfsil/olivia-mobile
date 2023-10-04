import { PermissionsAndroid } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { useEffect, useState } from "react";
import { useRealm } from "../../hooks/realm";
import { useAuth } from "../../hooks/auth";

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
  timestamp: Date;
}
interface LocationProps {
  requestLocationsPermissions: () => Promise<boolean>;
  monitorLocation: () => void;
}

function useLocation(): LocationProps {
  const [location, setLocation] = useState<Location>();

  const realm = useRealm();
  const { user } = useAuth();

  useEffect(() => {
    console.log(location);
    if (location) {
      realm.write(() => {
        realm.create("Positions", {
          _id: new Realm.BSON.ObjectId(),
          user_id: new Realm.BSON.ObjectId(user?._id),
          coordinates: location.altitude ? [location.longitude, location.latitude, location.altitude]: [location.longitude, location.latitude],
          created_at: location.timestamp,
        });
      });
    }
  }, [location, realm, user]);

  const requestLocationsPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Geolocation Permission",
          message: "Can we access your location?",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      console.log("granted", granted);
      if (granted === "granted") {
        console.log("You can use Geolocation");
        return true;
      } else {
        console.log("You cannot use Geolocation");
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const monitorLocation = () => {
    Geolocation.watchPosition(
      (position) => {
        
        setLocation({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          altitude: position.coords.altitude,
          timestamp: new Date(),
        });
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 10000,
        interval: 60000,
      }
    );
  };

  return {
    requestLocationsPermissions,
    monitorLocation,
  };
}

export default useLocation;
