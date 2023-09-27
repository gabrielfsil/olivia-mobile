import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/Private/Home";
import { ListDevices } from "../screens/Private/ListDevices";
import { Login } from "../screens/Public/Login";
import { Register } from "../screens/Public/Register";
import { useAuth } from "../hooks/auth";
import { ListServices } from "../screens/Private/ListServices";

const Stack = createNativeStackNavigator();

export function Routes() {
  const { user } = useAuth();

  return (
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
      {user ? (
        <Stack.Group>
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
          <Stack.Screen
            name="ListServices"
            component={ListServices}
            options={{
              title: "Serviços",
            }}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{
              title: "Registre-se",
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
