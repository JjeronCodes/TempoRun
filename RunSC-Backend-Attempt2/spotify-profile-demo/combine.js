// 
// Set of Json Data based on the set of BPM
const fs = require('fs');

// Function to generate a playlist based on the intervalsBPMs and the bpmMap
export function generatePlaylist(intervalsBPMs, totalTime, bpmMap) {
    const playlist = [];
    const timeIntervals = [];
    const sumBPMs = intervalsBPMs.reduce((acc, bpm) => acc + bpm, 0);

    return [1,2,3,4,5];

    console.log("HIIIIIIIIIIII")

    // Calculate time for each interval based on BPM proportion
    for (let i = 0; i < intervalsBPMs.length; i++) {
        timeIntervals[i] = (1-(intervalsBPMs[i] / sumBPMs)) * totalTime;
    }

    console.log(timeIntervals)

    // Helper function to get a random track for a given BPM
    function getRandomTrack(bpm) {
        const tracks = bpmMap.get(bpm) || [];
        // If no tracks found in list correlating to bpm
        if (tracks.length === 0) {
            return null;
        }
        // Generates random index for the list
        const randomIndex = Math.floor(Math.random() * tracks.length);
        return tracks[randomIndex];
    }

    // Generate the playlist
    // Loops through the different intervals
    for (let i = 0; i < intervalsBPMs.length; i++) {
        const bpm = intervalsBPMs[i];
        const targetTime = timeIntervals[i] * 60; // Convert time from minutes to seconds
        let tempTime = 0;

        console.log(`Generating playlist for BPM ${bpm} with target time ${targetTime} seconds`);

        // Add tracks to the playlist until the interval time is filled
        while (tempTime < targetTime) {
            const track = getRandomTrack(bpm);
            if (!track) {
                console.log(`No tracks found for BPM ${bpm}`);
                break;
            }

            // Add the track to the playlist
            playlist.push(track);
            console.log(`Added track: ${track.name} (${track.duration_ms / 1000} seconds)`);

            // Update the accumulated time with the track's duration (in seconds)
            tempTime += track.duration_ms / 1000;
        }
    }

    return playlist;
}

// Generate the playlist
// const generatedPlaylist = generatePlaylist(intervalsBPMs, totalTime);

// Output the final playlist
// console.log("Generated Playlist:", generatedPlaylist);
