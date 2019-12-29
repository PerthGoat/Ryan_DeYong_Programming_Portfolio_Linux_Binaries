class DEFLATE {
    constructor(input_params) {
        // constant variables
        this.window_size = 4096;
        this.original_input_string = input_params['IN_STRING'];
        this.compressed_stream = input_params['IN_COMPRESSED'];
    }
    setInputString(input_string) {
        this.original_input_string = input_string;
    }
    setCompressedString(compressed_string) {
        this.compressed_stream = compressed_string;
    }
    //public setCompressionString(
    moveFromInputToWindow() {
        let o = this.input_string[0];
        this.input_string = this.input_string.substring(1, this.input_string.length);
        this.selwin += o;
        if (this.selwin.length > this.window_size) {
            this.selwin = this.selwin.substring(1, this.selwin.length);
        }
    }
    searchForSimilar() {
        let j = 0;
        let similar = this.input_string[j++];
        while (this.selwin.includes(similar) && j < this.input_string.length) {
            similar += this.input_string[j++];
        }
        if (similar.length > 1 && j < this.input_string.length) {
            similar = similar.substring(0, similar.length - 1);
        }
        let offset = this.selwin.indexOf(similar);
        let length = similar.length;
        this.debug_string += similar;
        if (offset != -1) {
            let compressed_chunk = `[${offset.toString(16)},${length.toString(16)}]`;
            if (similar.length > compressed_chunk.length) {
                this.compressed_stream += compressed_chunk;
            }
            else {
                this.compressed_stream += similar;
            }
        }
        else {
            this.compressed_stream += similar;
        }
        for (let i = 0; i < length; i++) {
            this.moveFromInputToWindow();
        }
    }
    compress() {
        if (this.original_input_string == undefined) {
            alert("ERROR Input String Undefined");
            return "ERROR Input String Undefined";
        }
        this.input_string = this.original_input_string; // grab the original_input_string since input_string gets consumed during compression
        this.compressed_stream = "";
        this.debug_string = "";
        this.selwin = "";
        while (this.input_string.length > 0) {
            this.searchForSimilar();
        }
        if (this.debug_string != this.original_input_string) {
            alert("ERROR Input string does not match compressed stream");
            return "ERROR Input string does not match compressed stream";
        }
        return this.compressed_stream;
    }
    decompress() {
        if (this.compressed_stream == undefined) {
            alert("ERROR compressed stream is undefined");
            return "ERROR compressed stream is undefined";
        }
        let decompressed_stream = "";
        let selwin = "";
        for (let i = 0; i < this.compressed_stream.length; i++) {
            let c = this.compressed_stream[i];
            if (c == "[") {
                let decoded_compression_token = "";
                while (c != "]") {
                    c = this.compressed_stream[++i];
                    if (c != "]") {
                        decoded_compression_token += c;
                    }
                }
                let decoded_token_pair = decoded_compression_token.split(",");
                let offset = parseInt(decoded_token_pair[0], 16);
                let length = parseInt(decoded_token_pair[1], 16);
                let selwin_chunk = selwin.substring(offset, offset + length);
                selwin += selwin_chunk;
                decompressed_stream += selwin_chunk;
                while (selwin.length > this.window_size) {
                    selwin = selwin.substring(1, selwin.length);
                }
                continue;
            }
            selwin += c;
            decompressed_stream += c;
            if (selwin.length > this.window_size) {
                selwin = selwin.substring(1, selwin.length);
            }
        }
        return decompressed_stream;
    }
    // compresses the string, and then converts it to base64 with btoa, and then compresses that base64
    // sometimes this can achieve even higher compression ratios
    doubleCompressBase64() {
        let c1 = this.compress();
        this.original_input_string = btoa(c1);
        return this.compress();
    }
}
/// <reference path="lzss.ts" />
function compressText() {
    let text_entry = document.getElementById("text_entry").value;
    let compressed_string = new DEFLATE({ IN_STRING: text_entry, IN_COMPRESSED: "" }).compress();
    document.getElementById("compressed_text").value = compressed_string;
    if (text_entry.length != 0) {
        document.getElementById("compression_ratio").innerText = (compressed_string.length / text_entry.length * 100).toPrecision(5) + "%";
    }
    else {
        document.getElementById("compression_ratio").innerText = "";
    }
    //console.log(compressed_string);
}
function decompressText() {
    let text_entry = document.getElementById("compressed_text").value;
    let decompressed_string = new DEFLATE({ IN_STRING: "", IN_COMPRESSED: text_entry }).decompress();
    document.getElementById("decompressed_text").value = decompressed_string;
}
