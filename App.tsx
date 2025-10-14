import * as React from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

//define navigation strucure: I want a stack naviatoit wtha s creen called Home where that screeen shows the HomeScreen component
const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'My Home',
      },
    },
   Details: {
    screen: DetailsScreen,
      options: {
        title: 'Details Page',
      },
   },
  },
});

//turn the blueprnit into actual navigation. conversts into a react component. Can render the Navigation component
const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />
}

