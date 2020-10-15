import * as ActionTypes from './ActionTypes';

export const profileLoading = () => ({
    type: ActionTypes.PROFILE_LOADING
});

export const profileAdd = (info) => ({
    type: ActionTypes.PROFILE_ADD,
    payload: info.result
});

export const profileFailed = (msg) => ({
    type: ActionTypes.PROFILE_FAILED,
    payload: msg
});

export const fetchProfile = (nickname) => (dispatch) => {
    dispatch(profileLoading());

    return fetch('/api/user/' + nickname)
        .then(response => response.json())
        .then(result => dispatch(profileAdd(result)))
        .catch(error => dispatch(profileFailed(error.message)));
};