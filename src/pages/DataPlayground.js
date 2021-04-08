import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentRoute, setPlaygroundFrozenStreams } from '../store/actions';

import Page from '../components/Page';
import Header from '../components/Header';
import PlanetView from '../components/PlanetView';
import CircleToggle from '../components/CircleToggle';
import Footer from '../components/Footer';
import { colors } from '../utils/definitions';
import { hexToRgba } from '../utils/functions';

class DataPlayground extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - acc ({ x, y, z })
    // - gyr ({ x, y, z })
    // - mag ({ x, y, z })

    this.state = {
      // was : frozenStreams: this.props.playground.frozenStreams,
      frozenStreams: {
        acc: null,
        filteredAcc: null,
        gyr: null,
        mag: null,
      }
    }
  }

  render() {
    return (
      <Page enabled={this.props.enabled}>
        <Header
          title="Data playground"
          nbDots="3"
          activeDot="1"
          hasLeftArrow={true}
          hasRightArrow={true}
          onPressLeft={() => {
            this.props.setCurrentRoute('gizmo');            
          }}
          onPressRight={() => {
            this.props.setCurrentRoute('touchzone');            
          }}/>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

          <View
            style={{
              flex: 1,
              width: '100%',
            }}>
            {
              true &&
              <PlanetView
                enabled={this.props.enabled}
                acc={this.state.frozenStreams.acc || this.props.acc}
                filteredAcc={this.state.frozenStreams.filteredAcc || this.props.filteredAcc}
                gyr={this.state.frozenStreams.gyr || this.props.gyr}
                mag={this.state.frozenStreams.mag || this.props.mag}/>
            }
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
            <CircleToggle
              size={60}
              label="Acc"
              bgColor={colors.yellow}
              fgColor="#000000"
              sideMargins={15}
              enabled={this.state.frozenStreams.acc}
              onPress={enabled => {
                const frozenStreams = {
                  ...this.state.frozenStreams, // was : ...this.props.playground.frozenStreams
                  acc: enabled ? { ...this.props.acc } : null,
                  filteredAcc: enabled ? { ...this.props.filteredAcc } : null,
                };
                this.setState({ frozenStreams })
                // this.props.setPlaygroundFrozenStreams(frozenStreams);
              }}/>
            <CircleToggle
              size={60}
              label="Gyr"
              bgColor={colors.blue}
              fgColor="#000000"
              sideMargins={15}
              enabled={this.state.frozenStreams.gyr}
              onPress={enabled => {
                const frozenStreams = {
                  ...this.state.frozenStreams, // was : ...this.props.playground.frozenStreams
                  gyr: enabled ? { ...this.props.gyr } : null,
                };
                this.setState({ frozenStreams })
                // this.props.setPlaygroundFrozenStreams(frozenStreams);
              }}/>
            <CircleToggle
              size={60}
              label="Mag"
              bgColor={colors.red}
              fgColor="#000000"
              sideMargins={15}
              enabled={this.state.frozenStreams.mag}
              onPress={enabled => {
                const frozenStreams = {
                  ...this.state.frozenStreams, // was : ...this.props.playground.frozenStreams
                  mag: enabled ? { ...this.props.mag } : null,
                };
                this.setState({ frozenStreams })
                // this.props.setPlaygroundFrozenStreams(frozenStreams);
              }}/>
          </View>
        </View>

      </Page>
    );
  }
};

const mapStateToProps = state => {
  const { playground } = state;
  return { playground };
};


const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    setCurrentRoute,
    setPlaygroundFrozenStreams,
  }, dispatch)
};


export default connect(mapStateToProps, mapDispatchToProps)(DataPlayground);
