/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { Skin } from './models/skin'

//Embed the player

const playerContainer = document.getElementById("player-container");
const playerOptions = { skin: new Skin(playerContainer), segment: 1.0 };
const videoId = 1;
WebTvPlayer.withCredentials = false;
const webTvPlayer = new WebTvPlayer(playerContainer, videoId, playerOptions);
