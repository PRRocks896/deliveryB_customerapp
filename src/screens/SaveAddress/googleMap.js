import React, { Component } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Dimensions, PermissionsAndroid } from 'react-native';
import MapView from "react-native-maps";
const { width, height } = Dimensions.get('window')
import Icon from 'react-native-vector-icons/MaterialIcons'
navigator.geolocation = require('@react-native-community/geolocation');
import Geolocation from 'react-native-geolocation-service';
import { EventRegister } from 'react-native-event-listeners'
// Disable yellow box warning messages
console.disableYellowBox = true;
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
export default class GoogleMapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      region: {
        latitude: 22.2856,
        longitude: 70.7561,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      isMapReady: false,
      marginTop: 0,
      userLocation: "",
      regionChangeProgress: false
    };
    
  }

  
  componentWillMount = async () => {

    this.props.isparamsData == true && this.setState({
      region: {
        latitude: this.props.latitude,
        longitude: this.props.longitude
      }
    })
   
     console.log("this.props", this.props)

    // For Gps Permission 
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Tribata shop app',
          'message': 'Example App access to your location '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Get Current Location 

          this.getLocation();
      } else {
        alert("Location permission denied");
      }
    } catch (err) {
      console.warn(err)
    }

  }

  /**
   * Get Current Location
   */

  getLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001
        };
        this.setState({
          region: region,
          loading: false,
          error: null,
        });
      },
      (error) => {
        alert(error.message);
        this.setState({
          error: error.message,
          loading: false
        })
      },
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 },
    );
  }
  onMapReady = () => {
    this.setState({ isMapReady: true, marginTop: 0 });
  }

  /**
   * Fetch location details as a JOSN from google map API
   */
  fetchAddress = () => {
    //   console.log("Lat long",this.state.region.latitude,this.state.region.longitude)

    EventRegister.emit('Lat', this.state.region.latitude)
    EventRegister.emit('Long', this.state.region.longitude)
console.log("fetch lat long=============",this.props.isparamsData,  this.state.region.latitude, this.state.region.longitude)
//  let url = 
    fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + this.state.region.latitude + "," + this.state.region.longitude + "&key=" + "AIzaSyAAyBoIK3-3psCrVDMpZCKj5zaMmDAPp0I")
      .then((response) => response.json())
      .then((responseJson) => {
        // console.log("==========================",responseJson.results[0].address_components)
        EventRegister.emit('Lat', responseJson.results[0].geometry.location.lat)
        EventRegister.emit('Long', responseJson.results[0].geometry.location.lng)
        EventRegister.emit('address', responseJson.results[0].address_components)
        const userLocation = responseJson.results[0].formatted_address;
        EventRegister.emit('FullAddress',userLocation )
        this.setState({
          userLocation: userLocation,
          regionChangeProgress: false
        });
      });
  }

  /**
   * 
   * @param { any } region Update state on region change
   */
  onRegionChange = region => {
    this.setState({
      region,
      regionChangeProgress: true
    }, () => this.fetchAddress());
  }

  render() {

    if (this.state.loading) {
      return (
        <View style={styles.spinnerView}>
          <ActivityIndicator size="large" color={'#000'} />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={{ flex: 2 }}>
            {!!this.state.region.latitude && !!this.state.region.longitude &&
              <MapView
                style={{ ...styles.map, marginTop: this.state.marginTop }}
                initialRegion={this.state.region}
                showsUserLocation={true}
                onMapReady={this.onMapReady}
                onRegionChangeComplete={this.onRegionChange}
              >
                <MapView.Marker
                  coordinate={{ "latitude": this.state.region.latitude, "longitude": this.state.region.longitude }}
                  title={"Your Location"}
                  draggable
                />
              </MapView>
            }

            <View style={styles.mapMarkerContainer}>
              <Icon name={'location-on'} color={"#ad1f1f"} size={42} />
              {/* <Text style={{ fontFamily: 'fontawesome', fontSize: 42, color: "#ad1f1f" }}>&#xf041;</Text> */}
            </View>
          </View>
          <View style={styles.deatilSection}>
            <Text style={{ fontSize: 16, fontWeight: "bold", fontFamily: "roboto", marginBottom: 20 }}>{'Move For Location'}</Text>
            <Text style={{ fontSize: 10, color: "#999" }}>{'Location'}</Text>
            <Text numberOfLines={2} style={{ fontSize: 14, paddingVertical: 10, borderBottomColor: "silver", borderBottomWidth: 0.5, paddingRight: 10 }}>
              {!this.state.regionChangeProgress ? this.state.userLocation : "Identifying Location..."}</Text>

          </View>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    height: 550,
    width: 400,
    marginRight: 10
  },
  map: {
    flex: 1
  },
  mapMarkerContainer: {
    left: '47%',
    position: 'absolute',
    top: '42%'
  },
  mapMarker: {
    fontSize: 40,
    color: "red"
  },
  deatilSection: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    display: "flex",
    justifyContent: "flex-start"
  },
  spinnerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
});