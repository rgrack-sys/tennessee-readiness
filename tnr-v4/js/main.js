// ── GALLERY ──

async function loadGalleryPhotos() {
  try {
    const res = await fetch('/api/photos/approved');
    if (!res.ok) return;
    const { approved } = await res.json();
    if (approved && approved.length > 0) {
      approved.forEach(p => {
        const label = p.caption || p.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        renderGalleryPhoto(`/photos/${encodeURIComponent(p.key)}`, label);
      });
    }
  } catch {}
}

function renderGalleryPhoto(src, label) {
  const grid = document.getElementById('galleryGrid');
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative; overflow:hidden; aspect-ratio:4/3; background:#1a0f06;';

  const img = document.createElement('img');
  img.src = src;
  img.alt = label;
  img.style.cssText = 'width:100%; height:100%; object-fit:cover; filter:saturate(0.75); transition: transform 0.4s, filter 0.3s;';
  img.onmouseover = () => { img.style.transform = 'scale(1.05)'; img.style.filter = 'saturate(1)'; };
  img.onmouseout  = () => { img.style.transform = 'scale(1)';    img.style.filter = 'saturate(0.75)'; };

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = "position:absolute; bottom:0; left:0; right:0; padding:1rem; background:linear-gradient(transparent,rgba(20,10,2,0.8)); font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--fog);";
  labelDiv.textContent = label;

  wrapper.appendChild(img);
  wrapper.appendChild(labelDiv);
  grid.appendChild(wrapper);
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => uploadPhoto(file));
  event.target.value = '';
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById('uploadZone').style.borderColor = 'rgba(196,134,90,0.4)';
  const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  files.forEach(file => uploadPhoto(file));
}

async function uploadPhoto(file) {
  const msg = document.getElementById('uploadMsg');
  msg.textContent = 'Uploading...';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/photos/upload', { method: 'POST', body: formData });
    if (res.ok) {
      msg.textContent = 'Photo submitted! It will appear in the gallery after review.';
    } else if (res.status === 413) {
      msg.textContent = 'File too large (25MB max). Please try a smaller photo.';
    } else {
      msg.textContent = 'Upload failed. Please try again.';
    }
  } catch {
    msg.textContent = 'Upload failed. Please check your connection and try again.';
  }

  setTimeout(() => {
    msg.textContent = 'Click or drag & drop photos here \u2014 they\u2019ll be reviewed before appearing in the gallery';
  }, 5000);
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
      localStorage.setItem('tnr_bigchair_photo', e.target.result);
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
  zone.innerHTML = `
    <img src="${src}" alt="The Big Chair" style="width:100%; height:100%; object-fit:cover; display:block;">
    <button onclick="document.getElementById('bigChairUpload').click()" style="position:absolute; bottom:1rem; right:1rem; background:rgba(20,10,2,0.75); color:var(--fog); border:1px solid rgba(255,255,255,0.2); padding:0.4rem 0.9rem; font-family:'Barlow Condensed',sans-serif; font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; cursor:pointer;">Replace Photo</button>
  `;
  zone.style.position = 'relative';
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPhotos();

  const bigChair = localStorage.getItem('tnr_bigchair_photo');
  if (bigChair) renderBigChairPhoto(bigChair);
});
