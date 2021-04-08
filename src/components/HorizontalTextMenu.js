import React from 'react';
import {
  Pressable,
  Text,
  View
} from 'react-native';
import { colors } from '../utils/definitions';
import { hexToRgba } from '../utils/functions';

class HorizontalTextMenu extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - items ([{ text, event }, ...])
    // - activeItemIndex

    this.state = {
      activeItemIndex: this.props.activeItemIndex || 0,
      pressedItemIndex: -1,
    };

    this.textAlphaDarkBlue = hexToRgba(colors.darkBlue, 0.5);
    this.bgAlphaDarkBlue = hexToRgba(colors.darkBlue, 0.03);
  }

  componentDidMount() {
    // console.log(this.props.activeItemIndex);
    // this.setState({ activeItemIndex: this.props.activeItemIndex || 0 }, () => {
    //   const i = this.state.activeItemIndex;
    //   this.props.onPress(this.props.items[i].event, i);
    // });
  }

  render() {
    const items = [];

    this.props.items.forEach((item, i) => {
      const isActive = this.state.activeItemIndex === i;
      const isPressed = this.state.pressedItemIndex === i;
      items.push(
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: isPressed ?
                             this.bgAlphaDarkBlue :
                             'rgba(255,255,255,0.5)',
          }}>
          <Pressable
            onPressIn={() => { this.setState({ pressedItemIndex: i }); }}
            onPressOut={() => { this.setState({ pressedItemIndex: -1 }); }}
            onPress={() => {
              this.setState({ activeItemIndex: i }, () => {
                this.props.onPress(item.event, this.state.activeItemIndex);
              });
            }}>
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                padding: 10,
                color: isActive ? colors.darkBlue : this.textAlphaDarkBlue,
              }}>
              { item.text }
            </Text>
            <View style={{
              height: 7,
              backgroundColor: isActive ? colors.darkBlue : 'transparent' }}>
            </View>
          </Pressable>
        </View>
      );
    })

    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        { items }
      </View>
    );
  }
};

export default HorizontalTextMenu;