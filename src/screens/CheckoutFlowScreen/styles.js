import { StyleSheet } from "react-native";
import AppStyles from "../../AppStyles";

// const { width, height } = Dimensions.get("window");
// const paddingLeft = 13;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  card: {
    margin: 5,
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    elevation: 5
  },
  title: {
    fontFamily: AppStyles.fontFamily.regularFont,
    fontSize: 20,
    padding: 5
  },
  subtitle: {
    fontFamily: AppStyles.fontFamily.lightFont,
    fontSize: 18,
    padding: 5,
    right: 10,
    position: 'absolute'
  },
  adddeviverybtn: {
    borderColor: '#a3a3a3',
    borderRadius: 5,
    width: '40%',
    height: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});


// export default dynamicStyles;

export default styles;
