/*
 * LZSS Version 2
 * This improved version contains an optimized, encapsulated, better written
 * Compression functionality
 * Separated into 2 classes
 * 1 for the core compression functionality
 * 1 for extensions for improved compression time
 */
/*
 * Main compression technology class
 * Handles compression of strings of characters
 */
class DEFLATE2 {
    /*
     * Takes in a string and compresses it
     * return the compressed output as a base64 encoded string
     */
    static COMPRESS(s) {
        let sliding_window = ""; // define the sliding window
        let compressed_output = ""; // store the compressed output
        let sb = ""; // stringbuilder to store similar chains of characters
        // for each character in input string
        //for(const c of s) {
        for (let i = 0; i < s.length; i++) {
            let c = s[i];
            sb += c; // add the current character to the stringbuffer
            // while the sliding window includes the current stringbuffer
            if (sliding_window.includes(sb)) {
                continue; // skip loop iterations
            }
            // the matching string is the stringbuffer minus the non matching character
            let matching_string = sb.substring(0, sb.length - 1);
            // find the offset and length based on that
            let offset = sliding_window.indexOf(matching_string);
            let length = matching_string.length;
            // if the match length is greater than 0
            if (length > 0) {
                let compressed_chunk = `[${offset.toString(16)},${length.toString(16)}]`; // generate a compressed chunk
                // if the compressed chunk is more efficient to have
                if (length > compressed_chunk.length) {
                    compressed_output += compressed_chunk; // add it to the compressed output and rewind the stringbuffer using continue
                    sliding_window += matching_string; // add only the matching string to the sliding window, equal to the compressed chunk stuff
                    sb = ""; // clear stringbuffer
                    i--;
                    continue; // re-run the loop
                }
                else { // else just add it to the compressed output normally
                    compressed_output += matching_string;
                    sliding_window += matching_string;
                    sb = "";
                    i--;
                    continue;
                }
            }
            else { // if the length is 0 then add normally
                compressed_output += sb;
            }
            sliding_window += sb; // add the stringbuffer onto the sliding window now that it is no longer needed for processing
            // if the sliding window gets too big then slide it
            while (sliding_window.length > DEFLATE2.MAX_WINDOW_SIZE) {
                sliding_window = sliding_window.substring(1, sliding_window.length);
            }
            sb = ""; // reset the stringbuffer
        }
        // find the offset and length based on that
        let offset = sliding_window.indexOf(sb);
        let length = sb.length;
        // if the match length is greater than 0
        if (length > 0) {
            let compressed_chunk = `[${offset.toString(16)},${length.toString(16)}]`; // generate a compressed chunk
            // if the compressed chunk is more efficient to have
            if (length > compressed_chunk.length) {
                compressed_output += compressed_chunk; // add it to the compressed output and rewind the stringbuffer using continue
                sliding_window += sb; // add only the matching string to the sliding window, equal to the compressed chunk stuff
            }
            else { // else just add it to the compressed output normally
                compressed_output += sb;
                sliding_window += sb;
            }
        }
        else { // if the length is 0 then add normally
            compressed_output += sb;
        }
        return btoa(compressed_output); // btoa converts the compressed output to base64
    }
    /*
     * Takes in a string and decompresses it
     * returns the decompressed output
     */
    static DECOMPRESS(s) {
        let sliding_window = ""; // define the sliding window
        let decompressed_output = ""; // store the compressed output
        let sb = ""; // stringbuffer for decoding bracket sets
        for (const c of atob(s)) {
            // decoding continue chain
            // third step, if the ending bracket is encountered, eventually clear the stringbuilder and operate on it as needed for decoding
            if (c == "]") {
                sb = sb.substring(1, sb.length); // remove the opening bracket used to start the chain
                let chunks = sb.split(","); // split the offset and length apart into 2 values
                // parse the hexadecimal back into numbers
                let offset = parseInt(chunks[0], 16);
                let length = parseInt(chunks[1], 16);
                // grab the decoded string from the sliding window
                let decoded_string = sliding_window.substring(offset, offset + length);
                // add it to the sliding window
                sliding_window += decoded_string;
                // add it to the decompressed output
                decompressed_output += decoded_string;
                // if the sliding window gets too big then slide it
                while (sliding_window.length > DEFLATE2.MAX_WINDOW_SIZE) {
                    sliding_window = sliding_window.substring(1, sliding_window.length);
                }
                // reset the stringbuffer and skip to the next iteration
                sb = "";
                continue;
            }
            // second step, if the first step happened, keep adding characters to the stringbuilder
            if (sb != "") {
                sb += c;
                continue;
            }
            // first step, if we find an opening bracket, set stringbuilder to [ and redo the loop
            if (c == "[") {
                sb = c;
                continue;
            }
            sb = c;
            sliding_window += sb; // add the current stringbuffer onto the sliding window for building the decoding dictionary
            decompressed_output += sb; // add the stringbuffer to the decompressed output as well
            // if the sliding window gets too big then slide it
            while (sliding_window.length > DEFLATE2.MAX_WINDOW_SIZE) {
                sliding_window = sliding_window.substring(1, sliding_window.length);
            }
            sb = ""; // reset the stringbuffer
        }
        return decompressed_output;
    }
}
// maximum size for the sliding window to grow to
DEFLATE2.MAX_WINDOW_SIZE = 4096;
/// <reference path="lzss2.ts" />
let TextureHouse = {}; // holds references to textures loaded in by the Texture class
// standard vector2
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/*
 * The texture class handles holding textures, loading them, and processing their errors
 */
class Texture {
    constructor(flocation, loadOnCreate = false) {
        this.flocation = flocation;
        this.loaded = false;
        this.error_state = false;
        this.raw_texture_variable = this.flocation.split('.')[0];
        if (loadOnCreate === true) {
            this.loadT();
        }
    }
    importScript(src) {
        let script_tag = document.createElement("script");
        script_tag.setAttribute("src", "/resources/examples/js/textureManager/" + src);
        script_tag.onload = () => {
            this.loaded = true;
            let raw_data = TextureHouse[this.raw_texture_variable]; // gets the raw texture data
            // processes it into the 2 variables
            let split_data = raw_data.split(':');
            this.texture_data = DEFLATE2.DECOMPRESS(split_data[1]); // get the texture data and decompress it
            // get texture dimensions
            let split_dims = split_data[0].split('_');
            this.dims = new Vector2(parseInt(split_dims[0]), parseInt(split_dims[1]));
        };
        script_tag.onerror = () => {
            if (this.error_state === false) {
                console.warn("Could NOT load a texture that was requested, retrying in 100ms || " + this.flocation);
                this.error_state = true;
                setTimeout(() => { this.importScript(src); }, 100);
            }
            else {
                console.error("Could NOT load a texture that was requested, retry did not work || " + this.flocation);
            }
        };
        document.head.appendChild(script_tag);
    }
    getTextureData() {
        if (this.error_state === true) {
            console.warn("Trying to load an errored texture " + this.flocation);
            return;
        }
        if (this.loaded === false) {
            console.log("Asked for non loaded texture || " + this.flocation);
            return;
        }
        if (this.texture_data === undefined) {
            console.log("EMPTY TEXTURE " + this.flocation);
            return;
        }
        return { data: this.texture_data, dimensions: this.dims };
    }
    getTextureTag() {
        return this.raw_texture_variable;
    }
    loadT() {
        if (this.loaded === true) {
            alert("Load called on already loaded texture");
            return;
        }
        console.log("LOAD Texture " + this.flocation);
        this.importScript(this.flocation);
    }
}
/*
 * Easy creation and management of textures
 */
class TextureManager {
    constructor() {
        this.textures = {};
    }
    OpenTextureByName(name, openImmediate = false) {
        if (this.textures[name] === undefined) {
            let tex = new Texture(name + ".js", openImmediate);
            this.textures[tex.getTextureTag()] = tex;
        }
        else {
            console.log("Texture already loaded || " + name);
        }
    }
    GetTextureByName(name) {
        return this.textures[name];
    }
}
/// <reference path="TextureManager.ts" />
//let texture_location = "waller";
let tm = new TextureManager();
let scaling_factor_x = 25;
let scaling_factor_y = 25;
//tm.OpenTextureByName(texture_location, true);
function delayedLoad(texture_location, try_n = 0) {
    if (try_n > 10) {
        return;
    }
    let full_data = tm.GetTextureByName(texture_location).getTextureData();
    if (full_data === undefined) {
        console.warn("Texture didn't load");
        setTimeout(() => { delayedLoad(texture_location, try_n + 1); }, 100);
        return;
    }
    document.getElementById("image_info").value = TextureHouse[texture_location];
    document.getElementById("image_decompressed").value = full_data.data;
    let image_width = full_data.dimensions.x;
    let image_height = full_data.dimensions.y;
    let canvas = document.getElementById("mycanvas");
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < full_data.data.length; i += 9) {
        let ldata = full_data.data;
        let r = ldata[i] + ldata[i + 1] + ldata[i + 2];
        let g = ldata[i + 3] + ldata[i + 4] + ldata[i + 5];
        let b = ldata[i + 6] + ldata[i + 7] + ldata[i + 8];
        //console.log(r, g, b);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        let x = (i / 9) % image_width;
        let y = Math.floor((i / 9) / image_height);
        ctx.fillRect(x * scaling_factor_x, y * scaling_factor_y, 1 * scaling_factor_x, 1 * scaling_factor_y);
    }
}
document.getElementById("imgselect").onchange = (e) => {
    tm.OpenTextureByName(e.target.value, true);
    setTimeout(() => { delayedLoad(e.target.value); }, 100);
};
tm.OpenTextureByName(document.getElementById("imgselect").value, true);
setTimeout(() => { delayedLoad(document.getElementById("imgselect").value); }, 100);
