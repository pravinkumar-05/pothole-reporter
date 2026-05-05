// ============================================================
// REPORT.JS — Image Capture, Geotag EXIF, Location Picker, Form & Submit
// ============================================================

let reportMap = null;
let reportMarker = null;
let currentStep = 1;
let reportData = { imageData: null, location: null };

function initReportPage() {
    currentStep = 1;
    reportData = { imageData: null, location: null };
    showStep(1);
    // Reset form
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadZone').style.display = '';
    document.getElementById('geotagInfo').style.display = 'none';
    document.getElementById('geotagError').style.display = 'none';
    document.getElementById('step1Error').style.display = 'none';
    ['userName','userPhone','userEmail','description'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('severity').value = '';
    document.getElementById('roadType').value = '';
    document.getElementById('locationAddress').textContent = 'Click on the map or use auto-detect to set location';
    document.getElementById('locationCoords').textContent = '';
    // Hide success, show wizard
    document.getElementById('stepSuccess').style.display = 'none';
    document.querySelectorAll('.wizard-steps')[0].style.display = '';
    setTimeout(initReportMap, 200);
}

function showStep(n) {
    currentStep = n;
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('step' + n);
    if (panel) { panel.classList.add('active'); panel.style.display = 'block'; }

    document.querySelectorAll('.wizard-step').forEach(s => {
        const sn = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (sn === n) s.classList.add('active');
        if (sn < n) s.classList.add('completed');
    });

    if (n === 2) setTimeout(() => { if (reportMap) reportMap.invalidateSize(); }, 100);
    if (n === 4) buildReview();
}

// ============================================================
// EXIF GPS PARSER — Extract geotag from JPEG/TIFF images
// ============================================================
function extractExifGPS(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const view = new DataView(e.target.result);
            // Check for JPEG SOI marker
            if (view.getUint16(0) !== 0xFFD8) {
                resolve(null);
                return;
            }
            let offset = 2;
            while (offset < view.byteLength - 1) {
                const marker = view.getUint16(offset);
                if (marker === 0xFFE1) { // APP1 (EXIF)
                    const exifData = parseExif(view, offset + 4);
                    resolve(exifData);
                    return;
                }
                // Skip to next marker
                if ((marker & 0xFF00) !== 0xFF00) break;
                const segLen = view.getUint16(offset + 2);
                offset += 2 + segLen;
            }
            resolve(null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsArrayBuffer(file);
    });
}

function parseExif(view, exifStart) {
    // Check "Exif\0\0"
    const exifHeader = String.fromCharCode(
        view.getUint8(exifStart), view.getUint8(exifStart + 1),
        view.getUint8(exifStart + 2), view.getUint8(exifStart + 3)
    );
    if (exifHeader !== 'Exif') return null;

    const tiffStart = exifStart + 6;
    const byteOrder = view.getUint16(tiffStart);
    const littleEndian = (byteOrder === 0x4949); // 'II'

    // Verify TIFF magic number
    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002A) return null;

    const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
    // Find GPS IFD pointer in IFD0
    const gpsIFDOffset = findGPSIFD(view, tiffStart, tiffStart + ifd0Offset, littleEndian);
    if (gpsIFDOffset === null) return null;

    return parseGPSIFD(view, tiffStart, gpsIFDOffset, littleEndian);
}

function findGPSIFD(view, tiffStart, ifdOffset, littleEndian) {
    try {
        const entries = view.getUint16(ifdOffset, littleEndian);
        for (let i = 0; i < entries; i++) {
            const entryOffset = ifdOffset + 2 + (i * 12);
            const tag = view.getUint16(entryOffset, littleEndian);
            if (tag === 0x8825) { // GPSInfoIFDPointer
                const gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
                return tiffStart + gpsOffset;
            }
        }
    } catch (e) { /* ignore */ }
    return null;
}

function parseGPSIFD(view, tiffStart, gpsOffset, littleEndian) {
    try {
        const entries = view.getUint16(gpsOffset, littleEndian);
        let latRef = null, lngRef = null;
        let latData = null, lngData = null;

        for (let i = 0; i < entries; i++) {
            const entryOffset = gpsOffset + 2 + (i * 12);
            const tag = view.getUint16(entryOffset, littleEndian);
            const type = view.getUint16(entryOffset + 2, littleEndian);
            const count = view.getUint32(entryOffset + 4, littleEndian);

            switch (tag) {
                case 1: // GPSLatitudeRef (N/S)
                    latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                    break;
                case 2: // GPSLatitude
                    latData = readRationals(view, tiffStart, entryOffset + 8, 3, littleEndian);
                    break;
                case 3: // GPSLongitudeRef (E/W)
                    lngRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                    break;
                case 4: // GPSLongitude
                    lngData = readRationals(view, tiffStart, entryOffset + 8, 3, littleEndian);
                    break;
            }
        }

        if (latData && lngData && latRef && lngRef) {
            let lat = latData[0] + latData[1] / 60 + latData[2] / 3600;
            let lng = lngData[0] + lngData[1] / 60 + lngData[2] / 3600;
            if (latRef === 'S') lat = -lat;
            if (lngRef === 'W') lng = -lng;
            // Sanity check
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0)) {
                return { lat, lng };
            }
        }
    } catch (e) { /* ignore parsing errors */ }
    return null;
}

function readRationals(view, tiffStart, valueOffset, count, littleEndian) {
    // Rational values (count * 2 uint32s) are stored at offset pointed to by the value field
    const dataOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
    const result = [];
    for (let i = 0; i < count; i++) {
        const num = view.getUint32(dataOffset + (i * 8), littleEndian);
        const den = view.getUint32(dataOffset + (i * 8) + 4, littleEndian);
        result.push(den === 0 ? 0 : num / den);
    }
    return result;
}

// ============================================================
// IMAGE UPLOAD & CAMERA HANDLING
// ============================================================
const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const cameraInput = document.getElementById('cameraInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Open Camera button — triggers camera input
document.getElementById('btnOpenCamera').addEventListener('click', (e) => {
    e.stopPropagation();
    cameraInput.click();
});

// Browse File button — triggers file picker
document.getElementById('btnBrowseFile').addEventListener('click', (e) => {
    e.stopPropagation();
    imageInput.click();
});

// Drag and drop still works on the upload zone
uploadZone.addEventListener('click', (e) => {
    // Only trigger if clicking on the zone itself, not the buttons
    if (e.target === uploadZone || e.target.classList.contains('upload-icon') || 
        e.target.tagName === 'H3' || (e.target.tagName === 'P' && !e.target.id)) {
        imageInput.click();
    }
});
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault(); uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
});

// File inputs
cameraInput.addEventListener('change', () => { if (cameraInput.files.length) handleImageFile(cameraInput.files[0]); });
imageInput.addEventListener('change', () => { if (imageInput.files.length) handleImageFile(imageInput.files[0]); });

// Remove image
document.getElementById('removeImage').addEventListener('click', () => {
    reportData.imageData = null;
    reportData.location = null;
    imagePreview.style.display = 'none';
    uploadZone.style.display = '';
    document.getElementById('geotagInfo').style.display = 'none';
    document.getElementById('geotagError').style.display = 'none';
    document.getElementById('step1Error').style.display = 'none';
    imageInput.value = '';
    cameraInput.value = '';
});

async function handleImageFile(file) {
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }

    // Hide previous errors
    document.getElementById('geotagError').style.display = 'none';
    document.getElementById('geotagInfo').style.display = 'none';
    document.getElementById('step1Error').style.display = 'none';

    // Show processing state
    uploadZone.style.display = 'none';
    imagePreview.style.display = 'block';
    previewImg.src = '';
    previewImg.alt = 'Processing...';

    // Extract GPS from EXIF
    const gps = await extractExifGPS(file);

    if (!gps) {
        // No geotag — reject the photo
        imagePreview.style.display = 'none';
        uploadZone.style.display = '';
        document.getElementById('geotagError').style.display = 'block';
        reportData.imageData = null;
        imageInput.value = '';
        cameraInput.value = '';
        return;
    }

    // Photo has geotag — accept it
    const reader = new FileReader();
    reader.onload = (e) => {
        reportData.imageData = e.target.result;
        previewImg.src = e.target.result;
        previewImg.alt = 'Pothole photo';
        imagePreview.style.display = 'block';
        uploadZone.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Show geotag info
    document.getElementById('geotagInfo').style.display = 'block';
    document.getElementById('geotagCoords').textContent = `Lat: ${gps.lat.toFixed(6)}, Lng: ${gps.lng.toFixed(6)}`;

    // Auto-set location from geotag
    reportData.location = { lat: gps.lat, lng: gps.lng, address: '' };

    // Reverse geocode the geotag location
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.lat}&lon=${gps.lng}`)
        .then(r => r.json())
        .then(data => {
            const addr = data.display_name || `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`;
            reportData.location.address = addr;
            document.getElementById('geotagCoords').textContent = `Lat: ${gps.lat.toFixed(6)}, Lng: ${gps.lng.toFixed(6)} — ${addr}`;
        })
        .catch(() => {
            reportData.location.address = `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`;
        });
}

// ---- Location Map ----
function initReportMap() {
    if (reportMap) { reportMap.remove(); reportMap = null; reportMarker = null; }
    reportMap = L.map('reportMap').setView([19.7515, 75.7139], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(reportMap);

    reportMap.on('click', (e) => setMapLocation(e.latlng.lat, e.latlng.lng));
}

function setMapLocation(lat, lng) {
    if (reportMarker) reportMap.removeLayer(reportMarker);
    reportMarker = L.marker([lat, lng]).addTo(reportMap);
    reportMap.setView([lat, lng], 15);
    reportData.location = { lat, lng, address: '' };
    document.getElementById('locationCoords').textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

    // Reverse geocode
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
            const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            reportData.location.address = addr;
            document.getElementById('locationAddress').textContent = addr;
        })
        .catch(() => {
            reportData.location.address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            document.getElementById('locationAddress').textContent = reportData.location.address;
        });
}

// Auto-apply geotag location when entering step 2
function applyGeotagToMap() {
    if (reportData.location && reportData.location.lat && reportData.location.lng) {
        setMapLocation(reportData.location.lat, reportData.location.lng);
    }
}

document.getElementById('btnLocate').addEventListener('click', () => {
    if (!navigator.geolocation) { alert('Geolocation not supported by your browser.'); return; }
    document.getElementById('btnLocate').textContent = '⏳ Detecting...';
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            setMapLocation(pos.coords.latitude, pos.coords.longitude);
            document.getElementById('btnLocate').textContent = '📍 Auto-Detect My Location';
        },
        (err) => {
            alert('Could not detect location. Please click on the map to set it manually.');
            document.getElementById('btnLocate').textContent = '📍 Auto-Detect My Location';
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

// ---- Step Navigation ----
document.getElementById('step1Next').addEventListener('click', () => {
    const errorMsg = document.getElementById('step1Error');
    if (!reportData.imageData) { 
        errorMsg.style.display = 'block'; 
        return; 
    }
    errorMsg.style.display = 'none';
    showStep(2);
    // Auto-apply geotag location to map when moving to step 2
    setTimeout(applyGeotagToMap, 300);
});
document.getElementById('step2Prev').addEventListener('click', () => showStep(1));
document.getElementById('step2Next').addEventListener('click', () => {
    if (!reportData.location) { alert('Please set the location on the map.'); return; }
    showStep(3);
});
document.getElementById('step3Prev').addEventListener('click', () => showStep(2));
document.getElementById('step3Next').addEventListener('click', () => {
    const name = document.getElementById('userName').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const severity = document.getElementById('severity').value;
    const roadType = document.getElementById('roadType').value;
    const desc = document.getElementById('description').value.trim();
    if (!name || !phone || !severity || !roadType || !desc) { alert('Please fill all required fields.'); return; }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) { alert('Please enter a valid 10-digit phone number.'); return; }
    showStep(4);
});
document.getElementById('step4Prev').addEventListener('click', () => showStep(3));

// ---- Build Review ----
function buildReview() {
    const grid = document.getElementById('reviewGrid');
    grid.innerHTML = `
        <div class="detail-item"><label>Name</label><p>${document.getElementById('userName').value}</p></div>
        <div class="detail-item"><label>Phone</label><p>${document.getElementById('userPhone').value}</p></div>
        <div class="detail-item"><label>Email</label><p>${document.getElementById('userEmail').value || 'N/A'}</p></div>
        <div class="detail-item"><label>Severity</label><p><span class="severity-badge severity-${document.getElementById('severity').value}">${document.getElementById('severity').value}</span></p></div>
        <div class="detail-item"><label>Road Type</label><p>${document.getElementById('roadType').value.replace(/-/g,' ')}</p></div>
        <div class="detail-item"><label>Location</label><p>${reportData.location?.address || 'Set'}</p></div>
        <div class="detail-item full-width"><label>Description</label><p>${document.getElementById('description').value}</p></div>
    `;
}

// ---- Submit ----
document.getElementById('submitBtn').addEventListener('click', async () => {
    const complaint = {
        name: document.getElementById('userName').value.trim(),
        phone: document.getElementById('userPhone').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        description: document.getElementById('description').value.trim(),
        severity: document.getElementById('severity').value,
        roadType: document.getElementById('roadType').value,
        location: reportData.location,
        imageData: reportData.imageData
    };
    const result = await addComplaint(complaint);

    if (!result) {
        alert('Failed to submit complaint. Please try again.');
        return;
    }

    // Show success
    document.querySelectorAll('.step-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    document.querySelectorAll('.wizard-steps')[0].style.display = 'none';
    const successPanel = document.getElementById('stepSuccess');
    successPanel.style.display = 'block';
    successPanel.classList.add('active');
    document.getElementById('successId').textContent = result.id;
});
