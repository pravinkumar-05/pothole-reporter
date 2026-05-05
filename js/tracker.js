// ============================================================
// TRACKER.JS — Complaint Tracking by ID
// ============================================================

document.getElementById('trackBtn').addEventListener('click', trackComplaint);
document.getElementById('trackInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') trackComplaint();
});

async function trackComplaint() {
    const id = document.getElementById('trackInput').value.trim();
    const container = document.getElementById('trackResult');

    if (!id) { alert('Please enter a complaint ID.'); return; }

    const complaint = await getComplaintById(id);
    if (!complaint) {
        container.innerHTML = `
            <div class="glass-card" style="padding:48px; text-align:center;">
                <div style="font-size:3rem; margin-bottom:16px;">❌</div>
                <h3 style="color:var(--red-light); margin-bottom:8px;">Complaint Not Found</h3>
                <p style="color:var(--gray-400);">No complaint found with ID <strong style="color:var(--saffron)">${id}</strong></p>
                <p style="color:var(--gray-500); font-size:0.85rem; margin-top:8px;">Please check the ID and try again. Example: MH-RD-DEMO01</p>
            </div>`;
        return;
    }

    const statusColors = {
        'pending': 'var(--yellow)', 'under-review': 'var(--blue-light)',
        'in-progress': '#A78BFA', 'resolved': 'var(--green)'
    };

    container.innerHTML = `
        <div class="glass-card" style="padding:32px; margin-bottom:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
                <div>
                    <h3 style="color:var(--saffron); font-family:monospace; font-size:1.2rem;">${complaint.id}</h3>
                    <p style="color:var(--gray-400); font-size:0.85rem;">Submitted on ${formatDate(complaint.submittedAt)}</p>
                </div>
                <span class="complaint-status status-${complaint.status}" style="font-size:0.9rem; padding:6px 16px;">${formatStatus(complaint.status)}</span>
            </div>
            <div class="detail-grid">
                <div class="detail-item"><label>Complainant</label><p>${complaint.name}</p></div>
                <div class="detail-item"><label>Phone</label><p>${complaint.phone}</p></div>
                <div class="detail-item"><label>Severity</label><p><span class="severity-badge severity-${complaint.severity}">${complaint.severity}</span></p></div>
                <div class="detail-item"><label>Road Type</label><p>${(complaint.roadType || '').replace(/-/g, ' ')}</p></div>
                <div class="detail-item" style="grid-column:1/-1"><label>Location</label><p>📍 ${complaint.location?.address || 'Not specified'}</p></div>
                <div class="detail-item" style="grid-column:1/-1"><label>Description</label><p>${complaint.description}</p></div>
            </div>
            ${complaint.imageData ? `<img src="${complaint.imageData}" alt="Pothole" style="width:100%;border-radius:var(--radius-md);margin-top:12px;max-height:300px;object-fit:cover;">` : ''}
        </div>

        <div class="glass-card" style="padding:32px;">
            <h3 style="color:var(--white); margin-bottom:20px;">📋 Status Timeline</h3>
            <div class="timeline">
                ${complaint.statusHistory.map((h, i) => `
                    <div class="timeline-item ${i === complaint.statusHistory.length - 1 ? 'current' : ''}">
                        <div class="timeline-status" style="color:${statusColors[h.status] || 'var(--white)'}">${formatStatus(h.status)}</div>
                        <div class="timeline-date">${new Date(h.date).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}</div>
                        <div class="timeline-note">${h.note}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}
