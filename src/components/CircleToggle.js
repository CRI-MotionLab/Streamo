import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { hexToRgba } from '../utils/functions';

class CircleToggle extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - size
    // - label
    // - bgColor (hex)
    // - fgColor (hex)
    // - onPress (method)
    // - sideMargins

    // make sure enabled is true or false
    let enabled = this.props.enabled;
    enabled = (enabled !== true && enabled !== false) ? false : enabled;

    this.state = {
      pressed: false,
      enabled,
    };
  }

  render() {
    return (
      <View
        style={{
          width: this.props.size + 2 * this.props.sideMargins,
          height: this.props.size,
          alignItems: 'center',
        }}>
        <Pressable
          onPressIn={() => { this.setState({ pressed: true }); }}
          onPressOut={() => { this.setState({ pressed: false }); }}
          onPress={() => {
            const enabled = !this.state.enabled;
            this.setState({ enabled });
            this.props.onPress(enabled);
          }}>

          <View 
            style={{
              width: this.props.size,
              height: this.props.size,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: this.props.size / 2,
              backgroundColor:
                this.state.enabled ?
                (
                  this.state.pressed ?
                  hexToRgba(this.props.fgColor, 0.8) :
                  this.props.fgColor
                ) :
                (
                  this.state.pressed ?
                  hexToRgba(this.props.bgColor, 0.8) :
                  this.props.bgColor
                ),
            }}>
            <Text
              style={{
                fontSize: 14,
                color: this.state.enabled ?
                       this.props.bgColor :
                       this.props.fgColor,
              }}>
              { this.props.label }
            </Text>
          </View>

        </Pressable>
      </View>
    );
  }
};

export default CircleToggle;
