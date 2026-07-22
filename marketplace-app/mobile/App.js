import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/AuthContext';
import { CartProvider } from './src/CartContext';
import { FavoritesProvider } from './src/FavoritesContext';
import CatalogScreen from './screens/CatalogScreen';
import ProductScreen from './screens/ProductScreen';
import LoginScreen from './screens/LoginScreen';
import MerchantScreen from './screens/MerchantScreen';
import AccountScreen from './screens/AccountScreen';
import CartScreen from './screens/CartScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Catalog" component={CatalogScreen} />
              <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true, title: 'Producto' }} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Merchant" component={MerchantScreen} />
              <Stack.Screen name="Account" component={AccountScreen} />
              <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Mi carrito' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
