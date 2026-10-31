// ============================================================
// TRACKER.JS — Complaint Tracking by ID & Interactive Reset
// ============================================================

const trackBtn = document.getElementById('trackBtn');
const trackInput = document.getElementById('trackInput');
const trackResult = document.getElementById('trackResult');

if (trackBtn) {
    trackBtn.addEventListener('click', () => trackComplaint());
}

if (trackInput) {
    trackInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') trackComplaint();
    });
}

// Reset complaint tracking to enter new ID
function resetComplaintTrack() {
    const input = document.getElementById('trackInput');
    const result = document.getElementById('trackResult');
    if (input) {
        input.value = '';
        input.focus();
    }
    if (result) {
        result.innerHTML = '';
    }
}

// Render sample registered complaints for quick click
async function renderTrackPills() {
    const pillsContainer = document.getElementById('trackRecentPills');
    if (!pillsContainer) return;

    try {
        const complaints = await getComplaints();
        if (complaints && complaints.length > 0) {
            const sampleList = complaints.slice(0, 4);
            const labelText = (typeof t === 'function') ? t('sample_registered_ids') : 'Sample Registered IDs:';
            pillsContainer.innerHTML = `
                <span style="color:var(--text-muted);font-size:0.82rem;font-weight:600;margin-right:6px;">${labelText}</span>
                ${sampleList.map(c => `
                    <button type="button" class="track-pill-id" onclick="trackComplaintByIdDirect('${c.id}')" title="Click to track ${c.id}">
                        ${c.id} (${formatStatus(c.status)})
                    </button>
                `).join('')}
            `;
        }
    } catch (e) {
        pillsContainer.innerHTML = '';
    }
}

function trackComplaintByIdDirect(id) {
    const input = document.getElementById('trackInput');
    if (input) input.value = id;
    trackComplaint(id);
}

async function trackComplaint(overrideId) {
    const input = document.getElementById('trackInput');
    const container = document.getElementById('trackResult');
    const id = (overrideId || input?.value || '').trim();

    if (!container) return;

    if (!id) {
        alert((typeof t === 'function') ? t('alert_enter_id') : 'Please enter a complaint ID.');
        input?.focus();
        return;
    }

    const searchingText = (typeof t === 'function') ? t('searching_complaint') : 'Searching registered database for complaint';
    container.innerHTML = `
        <div class="glass-card" style="padding:32px; text-align:center;">
            <div class="loading-spinner" style="margin:0 auto 12px;width:32px;height:32px;"></div>
            <p style="color:var(--text-muted);font-size:0.9rem;">${searchingText} <strong>${escapeHtml(id)}</strong>...</p>
        </div>
    `;

    const complaint = await getComplaintById(id);
    if (!complaint) {
        const notFoundTitle = (typeof t === 'function') ? t('complaint_not_found') : 'Complaint Not Found';
        const notFoundMsg = (typeof t === 'function') ? t('no_complaint_found_msg') : 'No registered complaint found with ID';
        const checkFormatMsg = (typeof t === 'function') ? t('check_id_format') : 'Please check the ID format and try again (e.g., MH-2026-1001).';
        const resetBtnText = (typeof t === 'function') ? t('btn_reset_track') : '🔄 Reset to Enter Complaint ID';

        container.innerHTML = `
            <div class="glass-card" style="padding:40px 24px; text-align:center; max-width:680px; margin:0 auto;">
                <div style="font-size:3rem; margin-bottom:14px;">❌</div>
                <h3 style="color:var(--red); margin-bottom:8px;">${notFoundTitle}</h3>
                <p style="color:var(--text-muted); margin-bottom:12px;">${notFoundMsg} <strong style="color:var(--saffron);">${escapeHtml(id)}</strong></p>
                <p style="color:var(--text-subtle); font-size:0.85rem; margin-bottom:20px;">${checkFormatMsg}</p>
                <button type="button" class="btn-primary" onclick="resetComplaintTrack()" style="margin:0 auto;display:inline-flex;align-items:center;gap:6px;">
                    <span>${resetBtnText}</span>
                </button>
            </div>`;
        return;
    }

    const statusColors = {
        'pending': 'var(--yellow)',
        'under-review': 'var(--blue-light)',
        'in-progress': '#A78BFA',
        'resolved': 'var(--green)'
    };

    // Ensure statusHistory is resilient
    const history = (complaint.statusHistory && Array.isArray(complaint.statusHistory) && complaint.statusHistory.length > 0)
        ? complaint.statusHistory
        : [
            {
                status: complaint.status || 'pending',
                date: complaint.submittedAt || new Date().toISOString(),
                note: complaint.statusNote || ((typeof t === 'function') ? t('default_queue_note') : 'Complaint registered in statewide PWD system. Awaiting field inspection.')
            }
        ];

    const showingText = (typeof t === 'function') ? t('showing_registered_comp') : 'Showing registered complaint';
    const trackAnotherText = (typeof t === 'function') ? t('btn_track_another') : '🔄 Track Another Complaint (Reset)';
    const submittedOnText = (typeof t === 'function') ? t('submitted_on') : 'Submitted on';
    const complainantLabel = (typeof t === 'function') ? t('lbl_complainant') : 'Complainant';
    const phoneLabel = (typeof t === 'function') ? t('lbl_phone') : 'Phone';
    const severityLabel = (typeof t === 'function') ? t('lbl_severity') : 'Severity';
    const roadTypeLabel = (typeof t === 'function') ? t('lbl_road_type') : 'Road Type';
    const locationLabel = (typeof t === 'function') ? t('lbl_location') : 'Location';
    const descriptionLabel = (typeof t === 'function') ? t('lbl_description') : 'Description';
    const photoEvidenceLabel = (typeof t === 'function') ? t('lbl_photo_evidence') : 'Photographic Evidence';
    const statusTimelineTitle = (typeof t === 'function') ? t('status_timeline_title') : '📋 Official PWD Status Timeline';
    const resetBtnText = (typeof t === 'function') ? t('btn_reset_track') : '🔄 Reset to Enter Complaint ID';

    const localizedSeverity = (typeof t === 'function' && complaint.severity) 
        ? (t('sev_' + complaint.severity) || complaint.severity) 
        : (complaint.severity || 'Medium');

    const roadKey = 'road_' + (complaint.roadType || 'state-highway').replace(/-/g, '_');
    const localizedRoadType = (typeof t === 'function' && complaint.roadType)
        ? (t(roadKey) || (complaint.roadType || '').replace(/-/g, ' '))
        : (complaint.roadType || '').replace(/-/g, ' ');

    container.innerHTML = `
        <div style="max-width:760px; margin:0 auto;">
            <!-- Top Controls Row -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                <div style="font-size:0.9rem; color:var(--text-muted);">
                    ${showingText} <strong>${escapeHtml(complaint.id)}</strong>
                </div>
                <button type="button" class="btn-track-reset" onclick="resetComplaintTrack()" style="padding:8px 16px; font-size:0.85rem;">
                    <span>${trackAnotherText}</span>
                </button>
            </div>

            <!-- Complaint Details Card -->
            <div class="glass-card" style="padding:32px; margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
                    <div>
                        <h3 style="color:var(--saffron); font-family:monospace; font-size:1.35rem; margin-bottom:4px;">#${complaint.id}</h3>
                        <p style="color:var(--text-muted); font-size:0.85rem;">${submittedOnText} ${formatDate(complaint.submittedAt)}</p>
                    </div>
                    <span class="complaint-status status-${complaint.status}" style="font-size:0.9rem; padding:6px 16px;">
                        ${formatStatus(complaint.status)}
                    </span>
                </div>
                <div class="detail-grid">
                    <div class="detail-item"><label>${complainantLabel}</label><p>${escapeHtml(complaint.name || 'Citizen')}</p></div>
                    <div class="detail-item"><label>${phoneLabel}</label><p>${escapeHtml(complaint.phone || 'N/A')}</p></div>
                    <div class="detail-item"><label>${severityLabel}</label><p><span class="severity-badge severity-${complaint.severity}">${localizedSeverity}</span></p></div>
                    <div class="detail-item"><label>${roadTypeLabel}</label><p>${escapeHtml(localizedRoadType)}</p></div>
                    <div class="detail-item" style="grid-column:1/-1"><label>${locationLabel}</label><p>📍 ${escapeHtml(complaint.location?.address || 'Maharashtra State Road')}</p></div>
                    <div class="detail-item" style="grid-column:1/-1"><label>${descriptionLabel}</label><p>${escapeHtml(complaint.description || 'No description provided')}</p></div>
                </div>
                ${complaint.imageData ? `
                    <div style="margin-top:18px;">
                        <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:6px;font-weight:700;">${photoEvidenceLabel}</label>
                        <img src="${complaint.imageData}" alt="Pothole Damage Evidence" style="width:100%;border-radius:var(--radius-md);max-height:300px;object-fit:cover;border:1px solid var(--glass-border);">
                    </div>
                ` : ''}
            </div>

            <!-- Status Timeline Card -->
            <div class="glass-card" style="padding:32px; margin-bottom:24px;">
                <h3 style="color:var(--text-primary); margin-bottom:20px;">${statusTimelineTitle}</h3>
                <div class="timeline">
                    ${history.map((h, i) => `
                        <div class="timeline-item ${i === history.length - 1 ? 'current' : ''}">
                            <div class="timeline-status" style="color:${statusColors[h.status] || 'var(--text-primary)'}">${formatStatus(h.status)}</div>
                            <div class="timeline-date">${formatDate(h.date)}</div>
                            <div class="timeline-note">${escapeHtml(h.note || ((typeof t === 'function') ? t('default_pwd_update') : 'Status updated by PWD engineering team.'))}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align:center; margin-top:28px;">
                    <button type="button" class="btn-primary" onclick="resetComplaintTrack()" style="margin:0 auto;display:inline-flex;align-items:center;gap:6px;">
                        <span>${resetBtnText}</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    if (window.renderAllIcons) {
        window.renderAllIcons(container);
    }
}

// Auto-init pills on load & re-render on language change
document.addEventListener('DOMContentLoaded', () => {
    renderTrackPills();
});

window.addEventListener('languageChanged', () => {
    renderTrackPills();
    const input = document.getElementById('trackInput');
    if (input && input.value && input.value.trim()) {
        trackComplaint(input.value.trim());
    }
});
