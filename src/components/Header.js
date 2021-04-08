import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import ArrowButton from './ArrowButton';
import { colors } from '../utils/definitions';

class Header extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - title (string)
    // - nbDots (number)
    // - activeDot (number)
    // - hasLeftArrow (boolean)
    // - onPressLeft (method)
    // - hasRightArrow (boolean)
    // - onPressRight (method)
  }

  render() {
    const dotSize = 15;
    const dotRadius = dotSize * 0.5;

    const dotsWidth = (this.props.nbDots * 2 - 1) * dotSize;
    const dots = [];

    for (let i = 0; i < this.props.nbDots; i++) {
      dots.push(
        <Circle
          key={i}
          cx={dotRadius + 2 * i * dotSize}
          cy={dotRadius}
          r={dotRadius}
          fill={i == this.props.activeDot ? '#fff' : 'rgba(255,255,255,0.3)' }/>
      );
    }

    return (
      <View
        style={{
          zIndex: 10,
          elevation: 10,
          width: '100%',
          backgroundColor: colors.darkBlue,
        }}>

        <View
          style={{
            position: 'relative',
            width: '100%',
            height: 90,
          }}>

          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              // top: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: 'white', fontSize: 22 }}>
              { this.props.title }
            </Text>
          </View>

          {
            this.props.hasLeftArrow &&
            <View style={{ position: 'absolute', left: 50, top: 25, bottom: 25 }}>
              <ArrowButton
                bgColor="#fff"
                fgColor={colors.darkBlue}
                size="40"
                orientation="left"
                onPress={this.props.onPressLeft}/>
            </View>
          }

          {
            this.props.hasRightArrow &&
            <View style={{ position: 'absolute', right: 50, top: 25, bottom: 25 }}>
              <ArrowButton
                bgColor="#fff"
                fgColor={colors.darkBlue}
                size="40"
                orientation="right"
                onPress={this.props.onPressRight}/>
            </View>
          }      
        </View>

        <View
          style={{
            position: 'relative',
            width: '100%',
            height: 30,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
        <Svg
          width={dotsWidth}
          height={dotSize}
          viewBox={`0 0 ${dotsWidth} ${dotSize}`}
          strokeWidth="0">
          { dots }
        </Svg>
        </View>

      </View>
    );
  }
};

export default Header;