// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   RefreshControl,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "expo-router";

// export default function TicketsScreen() {
//   const [tickets, setTickets] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchTickets = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         "http://192.168.1.34:5002/api/tickets",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (Array.isArray(data)) {
//         setTickets(data);
//       } else {
//         setTickets([]);
//       }
//     } catch (error) {
//       console.log("Ticket Error:", error);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchTickets();
//     }, [])
//   );

//   const handleCancel = (ticketId) => {
//     Alert.alert(
//       "Cancel Ticket",
//       "Are you sure you want to cancel this ticket?",
//       [
//         { text: "No" },
//         {
//           text: "Yes",
//           onPress: () => cancelTicket(ticketId),
//         },
//       ]
//     );
//   };

//   const cancelTicket = async (ticketId) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `http://192.168.1.34:5001/api/tickets/${ticketId}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         Alert.alert("Cancelled ✅", "Ticket cancelled successfully");
//         fetchTickets();
//       } else {
//         Alert.alert("Error", "Could not cancel ticket");
//       }
//     } catch (error) {
//       Alert.alert("Error cancelling ticket");
//     }
//   };

//   const handleModify = (ticket) => {
//     Alert.alert(
//       "Modify Ticket",
//       "Seat changed to A2 (Demo)",
//       [
//         {
//           text: "OK",
//         },
//       ]
//     );
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchTickets();
//     setRefreshing(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>My Tickets 🎫</Text>

//       <FlatList
//         data={tickets}
//         keyExtractor={(item) => item._id}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           />
//         }
//         ListEmptyComponent={
//           <Text style={styles.empty}>
//             No tickets booked yet 🚍
//           </Text>
//         }
//         renderItem={({ item }) => (
//           <View style={styles.card}>
//             <Text style={styles.route}>
//               {item.from} → {item.to}
//             </Text>

//             <Text style={styles.info}>
//               Bus: {item.busName}
//             </Text>

//             <Text style={styles.info}>
//               Seat: {item.seatNumber}
//             </Text>

//             <Text style={styles.info}>
//               Seat Type: {item.seatType || "Window"}
//             </Text>

//             <Text style={styles.info}>
//               Travel Date:{" "}
//               {item.date
//                 ? new Date(item.date).toDateString()
//                 : "N/A"}
//             </Text>

//             <Text style={styles.price}>
//               ₹{item.price}
//             </Text>

//             <Text style={styles.status}>
//               Status: Confirmed ✅
//             </Text>

//             <View style={styles.buttonRow}>
//               <TouchableOpacity
//                 style={styles.modifyBtn}
//                 onPress={() => handleModify(item)}
//               >
//                 <Text style={styles.btnText}>Modify</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => handleCancel(item._id)}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#050B1A",
//     padding: 20,
//   },
//   title: {
//     color: "#fff",
//     fontSize: 22,
//     marginBottom: 20,
//   },
//   empty: {
//     color: "#aaa",
//     textAlign: "center",
//     marginTop: 50,
//   },
//   card: {
//     backgroundColor: "#111C2F",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   route: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   info: {
//     color: "#ccc",
//     marginTop: 5,
//   },
//   price: {
//     color: "#1E88FF",
//     fontSize: 16,
//     marginTop: 8,
//   },
//   status: {
//     color: "#4CAF50",
//     marginTop: 5,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 10,
//     justifyContent: "space-between",
//   },
//   modifyBtn: {
//     backgroundColor: "#FFA000",
//     padding: 8,
//     borderRadius: 8,
//     width: "48%",
//     alignItems: "center",
//   },
//   cancelBtn: {
//     backgroundColor: "#D32F2F",
//     padding: 8,
//     borderRadius: 8,
//     width: "48%",
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });