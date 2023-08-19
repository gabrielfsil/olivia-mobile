import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/Private/Home";
import { ListDevices } from "../screens/Private/ListDevices";
import { Login } from "../screens/Public/Login";
import { Register } from "../screens/Public/Register";
import { useAuth } from "../hooks/auth";

const Stack = createNativeStackNavigator();

export function Routes() {
  const { user } = useAuth();

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
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                title: "Login",
              }}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{
                title: "Registe-se",
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
