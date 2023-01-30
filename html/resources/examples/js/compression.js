/*
* LZSS/LZ77
* Ryan DeYong 6-2-2021
* This is an LZSS implementation in JavaScript
*/

// the sliding window is used to search for repeated strings in a data stream
// the size defines how far back can be searched for the common data
// even on modern hardware, there are benefits to limiting this
// mainly that the offets and lengths don't grow large on large data sets and ruin the point of compression by creating larger files
const sliding_window_sz = 1024;

// this function takes in a string and compresses it, and returns that compressed string
// it can handle full unicode, it cannot handle having square brackets present in the data stream however
// because it uses square brackets to indicate compressed text in human readable form
function CompressText(str) {
  // compress
  // sliding window, matching string, and output string
  let sw = '';
  let match = '';
  let strout = '';
  
  // this loops through each character of the input string
  for(let i = 0;i < str.length;i++) {
    // this piggybacks off the built in JavaScript function 'includes' to find matches
    // on first run, match is '' and sw is '', so adding str[i] will make this always fail first run
    // the reason I do this is because after the first run it will always check the previous character against the next character 
    // which is how I find matches in the sliding window
    if(sw.includes(match + str[i])) {
      match += str[i];
      continue;
    }
    
    // this code simply generates a string for if a match were to occur
    // i do this because if the generated human-readable string with square brackets
    // ends up being bigger than what it's trying to compress, there's no use making the
    // replacement
    let len = match.length;
    let pos = sw.indexOf(match);
    // the position and length are stored in radix 36 to save space on human readable compression
    let new_str = `[${pos.toString(36)},${len.toString(36)}]`;
    
    // this is testing whether it's worthwhile to replace the matched string with the compressed replacement
    if(match.length >= new_str.length) {
      strout += new_str;
    } else { // otherwise do not replace the matched string
      // i do this because if I don't rewind the matches then the partial match is discarded and won't be used in the next match search
      // which can hurt compression level although it is slower to rewind the stream
      if(match.length > 0) { // if you don't have this, on a 0 length match it will push i forwards which is not good behavior (minus a negative)
        i -= (match.length - 1); // this works because i = match.length before this, since i is always ahead of the match
        // so as a result subtracting the length minus 1 guarantees a proper rewind of i to 1 character after the match
      }
      // this sets match to the first character of itself
      // i use slice because if match is empty it returns an empty string
      // if i were to use square bracket array selection it would return UNDEFINED for an empty match
      match = match.slice(0, 1); 
      // finally add the 1 character to the output string
      strout += match;
    }
    
    // i do the match manipulation up there because then I can use the same sw code here for either if statement result
    sw += match;
    while(sw.length > sliding_window_sz) { // this shifts off characters at the beginning of the sliding window if it's grown too big
      sw = sw.substr(1);
    }
    // finally set match to the current character in the for loop, at the end of the loop so that it's the previous character on the next cycle
    match = str[i];
  }
  
  // this is the same as above, just repeating some things for if there's any characters left over in the buffer
  let len = match.length;
  let pos = sw.indexOf(match);
  let new_str = `[${pos.toString(36)},${len.toString(36)}]`;
  
  if(match.length >= new_str.length) {
    strout += new_str;
  } else { // this part is different because there doesn't need to be rewinding at the end of the data stream
    strout += match;
  }
  
  return strout;
}

// this is a decompression function for my sliding window compression
// it takes in a compressed string and returns a decompressed output
// the string ideally needs to have matching square brackets or weird results can occur
function DecompressText(str) {
  // decompress
  
  // sliding window and decompression output string
  let sw = '';
  let dcmpr = '';
  
  // go through every character of the compressed string
  for(let i = 0;i < str.length;i++) {
    // look for square brackets
    if(str[i] == '[') {
      // if there's a square bracket, extract chars until the ending bracket
      let vals = '';
      i++;
      while(str[i] != ']' && i < str.length) {
        vals += str[i];
        i++;
      }
      // use the gathered characters to get the values
      let splt = vals.split(',');
      // the position and length are stored in radix 36 to save space on human readable compression
      let pos = parseInt(splt[0], 36);
      let len = parseInt(splt[1], 36);
      
      // this uses the position and length to get the requested characters out of the sliding window
      let str_chunk = sw.substr(pos, len);
      
      // throw the decompressed data into the sliding window because it may be used later for further decompression
      sw += str_chunk;
      // slide the sliding window
      while(sw.length > sliding_window_sz) {
        sw = sw.substr(1);
      }
      
      // add the decompressed data to the decompressed string variable
      dcmpr += str_chunk;
    } else {
      // there is no compression here
      // if there's no square bracket simply build out the sliding window
      sw += str[i];
      while(sw.length > sliding_window_sz) {
        sw = sw.substr(1);
      }
      // and the decompressed string
      dcmpr += str[i];
    }
  }
  
  return dcmpr;
}