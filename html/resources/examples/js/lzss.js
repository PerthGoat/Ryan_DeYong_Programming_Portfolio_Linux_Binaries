const sliding_window_sz = 1024;

function compressText(str) {
  // compress
  let sw = '';
  let match = '';
  let strout = '';
  
  for(let i = 0;i < str.length;i++) {
    if(sw.includes(match + str[i])) {
      match += str[i];
      continue;
    }
    
    if(match.length >= 5) {
      let len = match.length;
      let pos = sw.indexOf(match);
      strout += `[${pos.toString(36)},${len.toString(36)}]`;
    } else {
      strout += match;
    }
    sw += match;
    while(sw.length > sliding_window_sz) {
      sw = sw.substr(1);
    }
    match = str[i];
  }

  if(match.length >= 5) {
    let len = match.length;
    let pos = sw.indexOf(match);
    strout += `[${pos.toString(36)},${len.toString(36)}]`;
  } else {
    strout += match;
  }
  
  return strout;
}

function decompressText(str) {
  // decompress
  sw = '';
  let dcmpr = '';

  for(let i = 0;i < str.length;i++) {
    if(str[i] == '[') {
      let vals = '';
      i++;
      while(str[i] != ']' && i < str.length) {
        vals += str[i];
        i++;
      }
      let splt = vals.split(',');
      let pos = parseInt(splt[0], 36);
      let len = parseInt(splt[1], 36);
      
      let str_chunk = sw.substr(pos, len);
      
      sw += str_chunk;
      while(sw.length > sliding_window_sz) {
        sw = sw.substr(1);
      }
      
      dcmpr += str_chunk;
    } else {
      sw += str[i];
      while(sw.length > sliding_window_sz) {
        sw = sw.substr(1);
      }
      dcmpr += str[i];
    }
  }
  
  return dcmpr;
}

function compressButton() { 
  let the_text = document.getElementById('in').value;
  let comp_text = compressText(the_text);
  document.getElementById('comp').value = comp_text;
  
  let ratio = comp_text.length / the_text.length;
  
  document.getElementById('ratio').innerText = `compression ratio: ${ratio.toFixed(3) * 100}%`;
}

function decompressButton() {
  let the_text = document.getElementById('comp').value;
  let decomp_text = decompressText(the_text);
  document.getElementById('decomp').value = decomp_text;
  
  console.assert(decomp_text == document.getElementById('in').value, 'decompression from the compressed string failed');
}