'use strict';

import React,{Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ListView
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
 
});

export default class Feed extends Component{
    constructor(props){
        super(props);

        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2)=> r1 != r2
        });

        this.state = {
            dataSource: ds.cloneWithRows([])
        };
    }

    componentDidMount(){
        this.fetchFeed();
    }
    fetchFeed(){
        require('./AuthService').getAuthInfo((err, authInfo)=>{
            var url = 'https://api.github.com/users/'+authInfo.user.login+'/received_events';

            fetch(url, {headers: authInfo.header})
            .then((response)=> response.json())
            .then((responseData)=>{
                var feedItems = responseData.filter((ev)=> ev.type == 'PushEvent');
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(feedItems)
                })
            })
        });
    }
    renderRow(rowData) {
        return (<Text style={{color:'#333', alignSelf:'center'}}>
                {rowData.actor.login}
                </Text>
        );
    }
    render(){
        return (
            <View style={{flex:1, justifyContent:'flex-start'}}>
            <ListView dataSource={this.state.dataSource} 
                    renderRow={this.renderRow.bind(this)} />
            </View>
        );
    }
}

