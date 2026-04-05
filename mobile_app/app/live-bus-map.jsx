import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function LiveBusMap() {

  const [buses, setBuses] = useState([]);

  const fetchBuses = async () => {

    try {

      const res = await fetch(
        "http://10.0.2.2:5002/api/admin/live-buses"
      );

      const data = await res.json();

      setBuses(data);

    } catch (error) {

      console.log("Map fetch error:", error);

    }

  };

  useEffect(() => {

    fetchBuses();

    const interval = setInterval(fetchBuses, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <View style={styles.container}>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 28.4595,
          longitude: 77.0266,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        {buses.map((bus) => (

          <Marker
            key={bus._id}
            coordinate={{
              latitude: bus.currentLocation?.latitude || 28.4595,
              longitude: bus.currentLocation?.longitude || 77.0266,
            }}
            title={bus.busName}
            description={`${bus.from} → ${bus.to}`}
          />

        ))}

      </MapView>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

});