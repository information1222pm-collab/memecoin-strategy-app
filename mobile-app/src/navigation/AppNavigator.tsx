import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';
import { colors } from '../theme/colors';

// Import all the screens we need to navigate to
import HomeScreen from '../screens/HomeScreen';
import TokenDetailScreen from '../screens/TokenDetailScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import RulesScreen from '../screens/RulesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// This function defines the bottom tabs
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
      }}
    >
      <Tab.Screen name="Radar" component={HomeScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Rules" component={RulesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// This is the main navigator for the whole app
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TokenDetail" 
          component={TokenDetailScreen} 
          options={({ route }) => ({ title: route.params.tokenName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
