// const express = require('express');
// const router = express.Router();

// router.post('/processData', (req, res) => {
//     const { goalTime, intervalsBPMs } = req.body;

//     // Validate the input data
//     if (!goalTime || !intervalsBPMs || !Array.isArray(intervalsBPMs)) {
//         return res.status(400).json({ error: 'Invalid input data' });
//     }

//     // Log the received variables for testing
//     console.log('Received goalTime:', goalTime);
//     console.log('Received intervalsBPMs:', intervalsBPMs);

//     // Example usage of the variables
//     const totalBPM = intervalsBPMs.reduce((sum, bpm) => sum + bpm, 0);
//     const averageBPM = totalBPM / intervalsBPMs.length;

//     console.log(`Total BPM: ${totalBPM}`);
//     console.log(`Average BPM: ${averageBPM}`);
//     console.log(`Goal Time: ${goalTime} minutes`);

//     // Send a response back to the client
//     res.status(200).json({
//         message: 'Data received successfully',
//         totalBPM,
//         averageBPM,
//         goalTime
//     });
// });

// module.exports = router;

/////////////////////////////////////////////////////////////

const clientId = "9560ef7bbc08430faa2c2ae1b5209dd5"; // Replace with your client ID
const clientSecret = "c5bbdc77b4f24414975139b4a11acf93";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
// import { goalTime, intervalsBPMs } from './index.js' 

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const likedSongs = await _getLikedSongs(accessToken);
    const seededSongIds = new Array(likedSongs.items[0].track.id, likedSongs.items[1].track.id, likedSongs.items[2].track.id, likedSongs.items[3].track.id, likedSongs.items[4].track.id);
    const map1 = new Map();
    map1.set(100, await _getRecommendations(accessToken, seededSongIds, 100));
    map1.set(90, await _getRecommendations(accessToken, seededSongIds, 90));
    map1.set(80, await _getRecommendations(accessToken, seededSongIds, 80));
    const user_id = await _getUser(accessToken);
    const playlist_id = await _createPlaylist(accessToken, user_id.id);

    const intervalsBPM = [80, 90, 100];
    const totalTime = 30;
    const playlist = await generatePlaylist(intervalsBPM, totalTime, map1);
    const playlist_names = await getNames(playlist);
    
    populateUIArtist(map1.get(80), playlist, playlist_names);
    await _addPlaylist(accessToken, playlist_id.id, playlist);
}

function populateUIArtist(profile, playlist, playlist_names) {
    document.getElementById("id").innerText = JSON.stringify(profile);
    document.getElementById("email").innerText = JSON.stringify(playlist);
    document.getElementById("url").innerText = JSON.stringify(playlist_names);
}

function getNames(playlist) {
    const names = [];
    for (let i = 0; i < playlist.length; i++) {
        names.push(playlist[i].name);
    }
    return names
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function _getRecommendations(token, seeds, bpm){
    const result = await fetch(`https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${seeds[0]}%2C${seeds[1]}%2C${seeds[2]}%2C${seeds[3]}%2C${seeds[4]}&min_tempo=${bpm-5}&max_tempo=${bpm+5}&target_tempo=${bpm}`, {
    //const result = await fetch(`https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    return await result.json();
}

function generatePlaylist(intervalsBPM, totalTime, bpmMap) {
    const playlist = [];
    const timeIntervals = [];
    const sumBPMs = intervalsBPM.reduce((acc, bpm) => acc + bpm, 0);

    // Calculate time for each interval based on BPM proportion
    for (let i = 0; i < intervalsBPM.length; i++) {
        timeIntervals[i] = (1-(intervalsBPM[i] / sumBPMs)) * totalTime;
    }

    // Helper function to get a random track for a given BPM
    function getRandomTrack(bpm) {
        const tracks = bpmMap.get(bpm).tracks || [];
        // If no tracks found in list correlating to bpm
        if (tracks.length == 0) {
            return null;
        }
        // Generates random index for the list
        const randomIndex = Math.floor(Math.random() * tracks.length);
        return tracks[randomIndex];
    }

    // Generate the playlist
    // Loops through the different intervals
    for (let i = 0; i < intervalsBPM.length; i++) {
        const bpm = intervalsBPM[i];
        const targetTime = timeIntervals[i] * 60; // Convert time from minutes to seconds
        let tempTime = 0;

        // Add tracks to the playlist until the interval time is filled
        while (tempTime < targetTime) {
            const track = getRandomTrack(bpm);
            // if (!track) {
            //     break;
            // }
            // Add the track to the playlist
            playlist.push(track);
            // Update the accumulated time with the track's duration (in seconds)
            tempTime += track.duration_ms / 1000;
        }
    }

    return playlist;
}

async function _getLikedSongs(token){
    const limit = 5;
    const result = await fetch(`https://api.spotify.com/v1/me/tracks?limits=${limit}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    return await result.json();
}

async function _getUser(token){
    const result = await fetch(`https://api.spotify.com/v1/me`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    return (await result.json());
}

async function _createPlaylist(token, id){
    const result = await fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
        method: 'POST',
        headers: { 'Authorization' : 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name : "H1"
        })
    });
    return (await result.json());
}

async function _addPlaylist(token, playlistID, playList){
    let URIS = [];
    for(let i = 0; i < playList.length; i++)
    {
        URIS.push(playList[i].uri);
    }
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'POST',
        headers: { 'Authorization' : 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: URIS
        })
    });
    return (await result.json());
}