import React from 'react'
import {
  Pressable,
  Text,
  View,
} from 'react-native';

class CircleValue extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - size
    // - circleColor
    // - label
    // - labelHeight
    // - value
    // - textColor
    // - sideMargins

    // this.state = { value: '0.00' };
  }

  formatValue(val) {
    let res = val.toFixed(2);
    return res < 0 ? `${res} ` : ` ${res} `;
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.value !== this.props.value;
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.props.value !== prevProps.value) {
  //     // this.setState({ value: this.formatValue(this.props.value) });
  //   }
  // }

  render() {
    return (
      <View
        style={{
          width: this.props.size + 2 * this.props.sideMargins,
          height: this.props.size + this.props.labelHeight,
          alignItems: 'center',
        }}>

        <View
          style={{
            width: this.props.size,
            height: this.props.labelHeight,
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 14, color: this.props.textColor }}>
            { this.props.label }
          </Text>
        </View>

        <View
          style={{
            width: this.props.size,
            height: this.props.size,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: this.props.size / 2,
            backgroundColor: this.props.circleColor,
          }}>
          <Text style={{ fontSize: 14, color: this.props.textColor }}>
            { this.formatValue(this.props.value) }
          </Text>
        </View>

      </View>
    );
  }
};

export default CircleValue;