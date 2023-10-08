import { PermissionsAndroid } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { useCallback } from "react";
import { useRealm } from "../../hooks/realm";
import { useAuth } from "../../hooks/auth";
import Realm from "realm";

interface LocationProps {
  requestLocationsPermissions: () => Promise<boolean>;
  monitorLocation: () => void;
}

function useLocation(): LocationProps {

  const realm = useRealm();
  const { user } = useAuth();

 
  const requestLocationsPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permissão de Localização",
          message: "Can we access your location?",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const grantedBackground = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );

      console.log("grantedBackground", grantedBackground);
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

  const monitorLocation = useCallback(() => {
    Geolocation.watchPosition(
      (position) => {
        console.log({
          coordinates: position.coords.altitude
            ? [
                position.coords.longitude,
                position.coords.latitude,
                position.coords.altitude,
              ]
            : [position.coords.longitude, position.coords.latitude],
          created_at: new Date(),
        });
        realm.write(() => {
          realm.create("Positions", {
            _id: new Realm.BSON.ObjectId(),
            user_id: new Realm.BSON.ObjectId(user?._id),
            coordinates: position.coords.altitude
              ? [
                  position.coords.longitude,
                  position.coords.latitude,
                  position.coords.altitude,
                ]
              : [position.coords.longitude, position.coords.latitude],
            created_at: new Date(),
          });
        });
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        interval: 60000,
      }
    );
  }, [realm, user]);

  return {
    requestLocationsPermissions,
    monitorLocation,
  };
}

export default useLocation;
