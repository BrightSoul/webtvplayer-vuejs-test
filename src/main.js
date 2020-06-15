import Skin from './models/skin';

//Embed the player

const playerContainer = document.getElementById('player-container');
const playerOptions = { skin: Skin, segment: 1.0 };
const videoId = 1;
/* eslint-disable no-undef */
WebTvPlayer.withCredentials = false;
new WebTvPlayer(playerContainer, videoId, playerOptions);
