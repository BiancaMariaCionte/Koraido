import { TouchableOpacity, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const CustomCheckbox = ({ isChecked, onChange }) => (
  <TouchableOpacity onPress={onChange} style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Ionicons
      name={isChecked ? "checkbox" : "square-outline"}
      size={24}
      color={isChecked ? "#6b88c4" : "#ccc"}
    />
    <Text style={{ marginLeft: 8 }}>Your Label</Text>
  </TouchableOpacity>
);

export default CustomCheckbox