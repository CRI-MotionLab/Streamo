import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentRoute, setTouchZoneCoords } from '../store/actions';

import osc from '../utils/Osc';
import Page from '../components/Page';
import Header from '../components/Header';
import TouchSurface from '../components/TouchSurface';
import CircleValue from '../components/CircleValue';
import Footer from '../components/Footer';
import { colors } from '../utils/definitions';

class TouchZone extends React.Component {
  constructor(props) {
    super(props);
    const coords = this.props.touchzone.coords || {
      normTouchX: 0,
      normTouchY: 0,
    };

    this.state = {
      normTouchX: coords.normTouchX,
      normTouchY: coords.normTouchY,
      // touchSurfaceX: 0,
      // touchSurfaceY: 0,
      // touchSurfaceWidth: 0,
      // touchSurfaceHeight: 0,
    };
  }

  render() {
    return (
      <Page enabled={this.props.enabled}>
        <Header
          title="Touch zone"
          nbDots="3"
          activeDot="2"
          hasLeftArrow={true}
          hasRightArrow={false}
          onPressLeft={() => {
            console.log('lefty !');
            this.props.setCurrentRoute('playground');
          }}/>

        <View
          /*
          onLayout={event => {
            const { x, y, width, height } = event.nativeEvent.layout;
            this.setState({
              touchSurfaceX: x,
              touchSurfaceY: y,              
            });
          }}
          */
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

          <View
            /*
            onLayout={event => {
              const { x, y, width, height } = event.nativeEvent.layout;
              this.setState({
                touchSurfaceWidth: width,
                touchSurfaceHeight: height,
              });
            }}
            */
            style={{
              flex: 1,
              width: '100%',
            }}>
            <TouchSurface
              //x={this.state.touchSurfaceX}
              //y={this.state.touchSurfaceY}
              //width={this.state.touchSurfaceWidth}
              //height={this.state.touchSurfaceHeight}
              radius={50}
              color={colors.red}
              normTouchX={this.state.normTouchX}
              normTouchY={this.state.normTouchY}
              onTouchEvent={coords => {
                const { normTouchX, normTouchY } = coords;
                this.setState({ normTouchX, normTouchY });
                if (this.props.osc.isSending) {
                  osc.sendMessage('/touch', [ normTouchX, normTouchY ]);
                }
                // clash this into redux !
                // this.props.setTouchZoneCoords(coords)
              }}/>
          </View>

          <View
            style={{
              position: 'relative',
              backgroundColor: colors.darkBlue,
              width: '100%',
              height: 40,
            }}>
          </View>

          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: 80,
              bottom: 0,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
            <CircleValue
              size={60}
              circleColor={colors.yellow}
              label="X"
              labelHeight={20}
              textColor="black"
              value={this.state.normTouchX}
              sideMargins={15}/>
            <CircleValue
              size={60}
              circleColor={colors.blue}
              label="Y"
              labelHeight={20}
              textColor="black"
              value={this.state.normTouchY}
              sideMargins={15}/>
          </View>
        </View>

      </Page>
    );
  }
};

const mapStateToProps = state => {
  const { touchzone, osc } = state;
  return { touchzone, osc };
};


const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    setCurrentRoute,
    setTouchZoneCoords,
  }, dispatch)
};


export default connect(mapStateToProps, mapDispatchToProps)(TouchZone);
