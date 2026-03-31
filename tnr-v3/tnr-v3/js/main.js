// ── PERSISTENT GALLERY ──
const GALLERY_KEY = 'tnr_porch_gallery';
const BIGCHAIR_KEY = 'tnr_bigchair_photo';

function loadSavedPhotos() {
  // Load gallery photos
  const saved = JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]');
  saved.forEach(photo => renderGalleryPhoto(photo.src, photo.label));

  // Load Big Chair photo
  const bigChair = localStorage.getItem(BIGCHAIR_KEY);
  if (bigChair) renderBigChairPhoto(bigChair);
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => readAndSaveGalleryPhoto(file));
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById('uploadZone').style.borderColor = 'rgba(196,134,90,0.4)';
  const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  files.forEach(file => readAndSaveGalleryPhoto(file));
}

function readAndSaveGalleryPhoto(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const label = file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]');
    saved.push({ src: e.target.result, label });
    try {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(saved));
    } catch(err) {
      alert('Storage full — try removing some photos first.');
      return;
    }
    renderGalleryPhoto(e.target.result, label);
  };
  reader.readAsDataURL(file);
}

function renderGalleryPhoto(src, label) {
  const grid = document.getElementById('galleryGrid');
  const idx = grid.children.length;
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative; overflow:hidden; aspect-ratio:4/3; background:#1a0f06;';

  const img = document.createElement('img');
  img.src = src;
  img.alt = label;
  img.style.cssText = 'width:100%; height:100%; object-fit:cover; filter:saturate(0.75); transition: transform 0.4s, filter 0.3s;';
  img.onmouseover = () => { img.style.transform='scale(1.05)'; img.style.filter='saturate(1)'; };
  img.onmouseout  = () => { img.style.transform='scale(1)';    img.style.filter='saturate(0.75)'; };

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = "position:absolute; bottom:0; left:0; right:0; padding:1rem; background:linear-gradient(transparent,rgba(20,10,2,0.8)); font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--fog);";
  labelDiv.textContent = label;

  // Delete button
  const del = document.createElement('button');
  del.textContent = '✕';
  del.title = 'Remove photo';
  del.style.cssText = 'position:absolute; top:0.5rem; right:0.5rem; background:rgba(20,10,2,0.7); color:var(--fog); border:none; width:26px; height:26px; cursor:pointer; font-size:0.85rem; opacity:0; transition:opacity 0.2s; border-radius:2px;';
  del.onclick = (e) => {
    e.stopPropagation();
    const allWrappers = Array.from(grid.children);
    const i = allWrappers.indexOf(wrapper);
    const saved = JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]');
    saved.splice(i, 1);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(saved));
    wrapper.remove();
  };
  wrapper.onmouseover = () => del.style.opacity = '1';
  wrapper.onmouseout  = () => del.style.opacity = '0';

  wrapper.appendChild(img);
  wrapper.appendChild(labelDiv);
  wrapper.appendChild(del);
  grid.appendChild(wrapper);
}

// ── BIG CHAIR ──
function handleBigChairUpload(event) {
  const file = event.target.files[0];
  if (file) readAndSaveBigChair(file);
}

function handleBigChairDrop(event) {
  event.preventDefault();
  document.getElementById('bigChairZone').style.borderColor = 'rgba(196,134,90,0.3)';
  const file = Array.from(event.dataTransfer.files).find(f => f.type.startsWith('image/'));
  if (file) readAndSaveBigChair(file);
}

function readAndSaveBigChair(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      localStorage.setItem(BIGCHAIR_KEY, e.target.result);
    } catch(err) { /* storage full, still show it */ }
    renderBigChairPhoto(e.target.result);
  };
  reader.readAsDataURL(file);
}

function renderBigChairPhoto(src) {
  const zone = document.getElementById('bigChairZone');
  zone.style.border = 'none';
  zone.style.padding = '0';
  zone.style.cursor = 'default';
  zone.onclick = null;
  // Add replace button overlay
  zone.innerHTML = \`
    <img src="\${src}" alt="The Big Chair" style="width:100%; height:100%; object-fit:cover; display:block;">
    <button onclick="document.getElementById('bigChairUpload').click()" style="position:absolute; bottom:1rem; right:1rem; background:rgba(20,10,2,0.75); color:var(--fog); border:1px solid rgba(255,255,255,0.2); padding:0.4rem 0.9rem; font-family:'Barlow Condensed',sans-serif; font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; cursor:pointer;">Replace Photo</button>
  \`;
  zone.style.position = 'relative';
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadSavedPhotos);