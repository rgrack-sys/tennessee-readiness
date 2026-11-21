// ── GALLERY ──

async function loadGalleryPhotos() {
  try {
    const res = await fetch('/api/photos/approved', { cache: 'no-store' });
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

async function reloadGallery() {
  const grid = document.getElementById('galleryGrid');
  if (grid) grid.innerHTML = '';
  await loadGalleryPhotos();
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
      await reloadGallery();
    } else if (res.status === 413) {
      msg.textContent = 'File too large (25MB max). Please try a smaller photo.';
    } else if (res.status === 415) {
      msg.textContent = 'Only photo files (JPG, PNG, etc.) can be uploaded.';
    } else if (res.status === 429) {
      msg.textContent = 'Thanks! You\u2019ve reached the upload limit for now. Please try again later.';
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

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPhotos();
});
