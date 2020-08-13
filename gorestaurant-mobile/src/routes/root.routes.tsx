import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import OrderConfirmedModal from '../pages/OrderConfirmedModal';
import AppRoutes from './app.routes';

const RootStack = createStackNavigator();

const RootRoutes: React.FC = () => (
  <NavigationContainer>
    <RootStack.Navigator mode="modal">
      <RootStack.Screen
        name="Main"
        component={AppRoutes}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="OrderConfirmedModal"
        options={{
          cardStyle: { opacity: 0.9 },
          headerShown: false,
        }}
        component={OrderConfirmedModal}
      />
    </RootStack.Navigator>
  </NavigationContainer>
);

export default RootRoutes;
