import buffer from 'buffer';
import {AsyncStorage} from 'react-native';
import _ from 'lodash';
const authKey = 'auth';
const userKey = 'user';

export default class AuthService {

    getAuthInfo(callback){
        AsyncStorage.multiGet([authKey, userKey], (err, val)=>{
            if(err){
                return callback(err);
            }

            if(!val){
                return callback();
            }
            
        
            let zippedObj = _.zipObject(val);
            if(!zippedObj[authKey]){
                return callback();
            }
            
            let authInfo = {
                header:{
                    Authorization: 'Basic' + zippedObj[authKey]
                },
                user: JSON.parse(zippedObj[userKey])
            }

            return callback(null, authInfo);
        })
    }
    login(creds, callback) {
        const auth = new buffer.Buffer(creds.username + ':' + creds.password);
        const encodedAuth = auth.toString('base64');
        fetch('https://api.github.com/user', {
            headers: {
                'Authorization': 'Basic ' + encodedAuth
            }
        })
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response;
                }

                throw {
                    badCredentials: response.status == 401,
                    unknownError: response.status != 401
                }
            })
            .then((response) => {
                return response.json();
            })
            .then((results) => {
                AsyncStorage.multiSet([
                    [authKey, encodedAuth],
                    [userKey, JSON.stringify(results)]
                ],
                    (err) => {
                        if (err) {
                            throw err;
                        }
                        return callback({ success: true });
                    }
                );
            })
            .catch((err) => {
                return callback(err);
            })
    }
}

