import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/Home";
import { ListDevices } from "../screens/ListDevices";

const Stack = createNativeStackNavigator();

export function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#855EE0",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "Olivia",
          }}
        />
        <Stack.Screen
          name="ListDevices"
          component={ListDevices}
          options={{
            title: "Dispositivos",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
