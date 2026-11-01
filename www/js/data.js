// DATA MANAGEMENT — API CRUD Calls & Local Storage Fallback
const ADMIN_KEY = 'mh_pothole_admin';
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };
const LOCAL_COMPLAINTS_KEY = 'mh_roadguard_local_complaints';

const API_BASE = `${window.location.origin}/api`;

const DEFAULT_COMPLAINTS = [
    {
        id: 'MH-2026-7821',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Large asphalt crater and roadway breakdown near Shivaji Chowk junction causing hazardous traffic swerving.',
        severity: 'critical',
        roadType: 'national-highway',
        location: { lat: 19.0178, lng: 72.8478, address: 'Shivaji Chowk, Dadar, Mumbai, Maharashtra' },
        status: 'in-progress',
        statusNote: 'PWD emergency rapid-repair squad on site with hot-mix bitumen & asphalt compactor.',
        submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'Complaint registered by citizen with GPS location verified.' },
            { status: 'under-review', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Structural inspection completed by PWD City Division.' },
            { status: 'in-progress', date: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), note: 'Repair team active on site with heavy machinery.' }
        ]
    },
    {
        id: 'MH-2026-6542',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Depression near storm drain grating along Western Express Highway flyover ramp.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 19.0664, lng: 72.8682, address: 'BKC Junction, Western Express Highway, Mumbai, Maharashtra' },
        status: 'under-review',
        statusNote: 'Joint inspection scheduled by PWD Highway Division and municipal engineers.',
        submittedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), note: 'Complaint logged in statewide PWD database.' },
            { status: 'under-review', date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Assigned to Highway maintenance section.' }
        ]
    },
    {
        id: 'MH-2026-4190',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Multiple pothole clusters along Andheri-Kurla Road near Chakala Metro pillar 42.',
        severity: 'medium',
        roadType: 'municipal-road',
        location: { lat: 19.1136, lng: 72.8697, address: 'Andheri-Kurla Road, Chakala, Andheri East, Mumbai, Maharashtra' },
        status: 'resolved',
        statusNote: 'Hot-mix asphalt patch completed & verified by municipal road inspector.',
        submittedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), note: 'Complaint registered by citizen reporter.' },
            { status: 'in-progress', date: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Patching work scheduled and carried out.' },
            { status: 'resolved', date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Repairs completed and road reopened to traffic.' }
        ]
    },
    {
        id: 'MH-2026-3318',
        name: 'Maharashtra Citizen',
        phone: '9876543210',
        email: 'citizen.mh@gmail.com',
        description: 'Edge raveling and deep rain crater approaching Vashi toll plaza connector.',
        severity: 'high',
        roadType: 'state-highway',
        location: { lat: 19.0771, lng: 72.9986, address: 'Palm Beach Road Connector, Vashi, Navi Mumbai, Maharashtra' },
        status: 'pending',
        statusNote: 'Complaint queued for Junior Engineer field inspection.',
        submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Complaint filed and queued in PWD system.' }
        ]
    },
    {
        id: 'MH-2026-9204',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Sub-grade breakdown and dangerous pavement depression near Hinjawadi Phase 1 approach.',
        severity: 'critical',
        roadType: 'municipal-road',
        location: { lat: 18.5913, lng: 73.7389, address: 'Hinjawadi IT Park, Pune-Mumbai Corridor, Maharashtra' },
        status: 'in-progress',
        statusNote: 'Sub-base excavation and vibratory roller compactor in operation.',
        submittedAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), note: 'Pothole report filed.' },
            { status: 'in-progress', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'PWD heavy machinery deployed.' }
        ]
    },
    {
        id: 'MH-2026-1044',
        name: 'Suresh Patil',
        phone: '9822145566',
        email: 'suresh.p@gmail.com',
        description: 'Pothole patch work active on lane 2 near Khalapur Toll on Mumbai-Pune Expressway.',
        severity: 'high',
        roadType: 'expressway',
        location: { lat: 18.8236, lng: 73.2982, address: 'Mumbai-Pune Expressway (E-Way), KM 38, Khalapur' },
        status: 'in-progress',
        statusNote: 'PWD emergency rapid-patch squad active with hot-mix bitumen & vibratory compactor.',
        submittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), note: 'Complaint registered by expressway patrol.' },
            { status: 'in-progress', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Road repair team on site.' }
        ]
    },
    {
        id: 'MH-2026-2189',
        name: 'Vikas Kadam',
        phone: '9822987123',
        email: 'vikas.k@gmail.com',
        description: 'Road surface fissure reported near Khandala Ghat Tunnel approach.',
        severity: 'critical',
        roadType: 'expressway',
        location: { lat: 18.7512, lng: 73.3872, address: 'Mumbai-Pune Expressway, Khandala Ghat Tunnel 2 Approach' },
        status: 'pending',
        statusNote: 'Reported by highway traveler. PWD Ghat engineering team notified.',
        submittedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Logged in PWD Highway Database.' }
        ]
    },
    {
        id: 'MH-2026-3401',
        name: 'Ajit Deshmukh',
        phone: '9823456781',
        email: 'ajit.deshmukh@gmail.com',
        description: 'Bituminous resurfacing completed over 2km stretch near Shirwal bypass on NH-48.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 18.1514, lng: 74.0156, address: 'NH-48 Highway, Shirwal Bypass Corridor, Satara District' },
        status: 'resolved',
        statusNote: 'Asphalt paving completed and inspected. Road open for full-speed transit.',
        submittedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Report filed.' },
            { status: 'in-progress', date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Milling & asphalt overlay active.' },
            { status: 'resolved', date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Repairs finished and road quality approved.' }
        ]
    },
    {
        id: 'MH-2026-4552',
        name: 'Rajendra Bhosale',
        phone: '9822654321',
        email: 'rajendra.b@gmail.com',
        description: 'Deep road potholes reported on Karad North bypass section of NH-48.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 17.4125, lng: 74.1520, address: 'NH-48 Corridor, Karad Northern Bypass, Satara, Maharashtra' },
        status: 'pending',
        statusNote: 'Complaint queued. Safety cones and warning signage positioned on lane.',
        submittedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), note: 'Reported by citizen.' }
        ]
    },
    {
        id: 'MH-2026-5620',
        name: 'Mahesh Shinde',
        phone: '9822334455',
        email: 'mahesh.s@gmail.com',
        description: 'Pothole restoration active at Shiroli Phata on NH-48 Kolhapur.',
        severity: 'critical',
        roadType: 'national-highway',
        location: { lat: 16.7450, lng: 74.2641, address: 'NH-48 Highway, Shiroli Phata, Kolhapur, Maharashtra' },
        status: 'in-progress',
        statusNote: 'PWD Kolhapur Division leveling and compacting aggregate sub-base.',
        submittedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Pothole reported by truck transporter.' },
            { status: 'in-progress', date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'Asphalt patching in progress.' }
        ]
    },
    {
        id: 'MH-2026-6712',
        name: 'Nitin Pawar',
        phone: '9822998877',
        email: 'nitin.pawar@gmail.com',
        description: 'Road repair team reinforcing pavement at Kasara Ghat on NH-160.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 19.6450, lng: 73.4912, address: 'NH-160 Highway, Kasara Ghat Section, Thane-Nashik Road' },
        status: 'in-progress',
        statusNote: 'Retaining edge asphalt reinstatement in active progress.',
        submittedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Ghat road damage noted.' },
            { status: 'in-progress', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Machinery deployed.' }
        ]
    },
    {
        id: 'MH-2026-7840',
        name: 'Ganesh More',
        phone: '9822771122',
        email: 'ganesh.more@gmail.com',
        description: 'Flyover approach on NH-160 Dwarka Circle Nashik fully restored.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 19.9882, lng: 73.8051, address: 'NH-160 Highway, Dwarka Circle Flyover Approach, Nashik' },
        status: 'resolved',
        statusNote: 'High-durability mastic asphalt resurfacing completed.',
        submittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), note: 'Reported.' },
            { status: 'resolved', date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Work completed.' }
        ]
    },
    {
        id: 'MH-2026-8910',
        name: 'Ashok Ahire',
        phone: '9822443322',
        email: 'ashok.ahire@gmail.com',
        description: 'Road crater on NH-53 Asian Highway Dhule Bypass filled and leveled.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 20.9042, lng: 74.7749, address: 'NH-53 Asian Highway Corridor, Dhule Bypass Junction' },
        status: 'resolved',
        statusNote: 'Pothole filled and road surface restored to standard IRI index.',
        submittedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 30 * 3600 * 1000).toISOString(), note: 'Reported.' },
            { status: 'resolved', date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Finished.' }
        ]
    },
    {
        id: 'MH-2026-9051',
        name: 'Sandip Chaudhari',
        phone: '9822556677',
        email: 'sandip.c@gmail.com',
        description: 'Potholes reported along Jalgaon-Bhusawal heavy freight lane on NH-53.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 21.0177, lng: 75.6126, address: 'NH-53 National Highway, Jalgaon-Bhusawal Road, Maharashtra' },
        status: 'pending',
        statusNote: 'Surface breakup reported on heavy freight lane. Queued for PWD action.',
        submittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Filed.' }
        ]
    },
    {
        id: 'MH-2026-9162',
        name: 'Sunil Wankhede',
        phone: '9822889900',
        email: 'sunil.w@gmail.com',
        description: 'Cold milling and dense bitumen macadam laying underway on NH-53 Akola Corridor.',
        severity: 'critical',
        roadType: 'national-highway',
        location: { lat: 20.7302, lng: 77.0682, address: 'NH-53 Highway, Akola East Corridor, Maharashtra' },
        status: 'in-progress',
        statusNote: 'Cold milling and dense bitumen macadam laying underway.',
        submittedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), note: 'Logged.' },
            { status: 'in-progress', date: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), note: 'Under repair.' }
        ]
    },
    {
        id: 'MH-2026-9273',
        name: 'Pradeep Deshmukh',
        phone: '9822667788',
        email: 'pradeep.d@gmail.com',
        description: 'Full depth asphalt repair completed along NH-53 Amravati Bypass.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 20.9320, lng: 77.7523, address: 'NH-53 National Highway, Badnera-Amravati Ring Road' },
        status: 'resolved',
        statusNote: 'Full depth asphalt repair completed by Amravati PWD circle.',
        submittedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), note: 'Registered.' },
            { status: 'resolved', date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'Resolved.' }
        ]
    },
    {
        id: 'MH-2026-9384',
        name: 'Rameshwar Raut',
        phone: '9822119933',
        email: 'rameshwar.r@gmail.com',
        description: 'Compaction active on newly placed hot mix at NH-53 Nagpur Outer Ring Road.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 21.1458, lng: 79.0882, address: 'NH-53 & Ring Road Interchange, Wadi-Hingna Link, Nagpur' },
        status: 'in-progress',
        statusNote: 'Vibratory roller compaction active on newly placed hot mix.',
        submittedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 15 * 3600 * 1000).toISOString(), note: 'Pothole noted.' },
            { status: 'in-progress', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Compaction in progress.' }
        ]
    },
    {
        id: 'MH-2026-9495',
        name: 'Eknath Shinde',
        phone: '9822337711',
        email: 'eknath.s@gmail.com',
        description: 'Samruddhi Mahamarg Shirdi Interchange pavement sealing finished.',
        severity: 'medium',
        roadType: 'expressway',
        location: { lat: 19.9012, lng: 74.4789, address: 'Samruddhi Expressway, Shirdi Interchange, Ahmednagar District' },
        status: 'resolved',
        statusNote: 'Expressway shoulder and pavement sealing completed.',
        submittedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), note: 'Reported.' },
            { status: 'resolved', date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), note: 'Verified done.' }
        ]
    },
    {
        id: 'MH-2026-9516',
        name: 'Balasaheb Jadhav',
        phone: '9822554433',
        email: 'balasaheb.j@gmail.com',
        description: 'Micro-surfacing squad engaged on Samruddhi Expressway near Aurangabad Shendra.',
        severity: 'high',
        roadType: 'expressway',
        location: { lat: 19.8920, lng: 75.4210, address: 'Samruddhi Expressway, Shendra Interchange Approach, Chhatrapati Sambhajinagar' },
        status: 'in-progress',
        statusNote: 'Surface micro-surfacing squad engaged on middle carriage.',
        submittedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 11 * 3600 * 1000).toISOString(), note: 'Surface dip reported.' },
            { status: 'in-progress', date: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), note: 'Active resurfacing.' }
        ]
    },
    {
        id: 'MH-2026-9627',
        name: 'Kailash Rathod',
        phone: '9822665544',
        email: 'kailash.r@gmail.com',
        description: 'Expansion joint dip reported by toll patrol on Samruddhi Expressway near Jalna.',
        severity: 'critical',
        roadType: 'expressway',
        location: { lat: 19.8340, lng: 75.8821, address: 'Samruddhi Expressway, Jalna Toll Ramp Connector' },
        status: 'pending',
        statusNote: 'Expansion joint dip reported by toll patrol. Inspection scheduled.',
        submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'Logged.' }
        ]
    },
    {
        id: 'MH-2026-9738',
        name: 'Pandurang Mane',
        phone: '9822778899',
        email: 'pandurang.m@gmail.com',
        description: 'Pothole trenches filled with asphalt emulsion along NH-52 near Georai-Beed section.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 19.3491, lng: 75.6601, address: 'NH-52 Highway, Georai-Beed Highway Section, Maharashtra' },
        status: 'in-progress',
        statusNote: 'PWD Beed maintenance unit filling pothole trenches with asphalt emulsion.',
        submittedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Noted.' },
            { status: 'in-progress', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Emulsion application active.' }
        ]
    },
    {
        id: 'MH-2026-9849',
        name: 'Hanumant Gaikwad',
        phone: '9822883344',
        email: 'hanumant.g@gmail.com',
        description: 'Pavement wear and edge potholes reported approaching NH-52 Solapur Northern bypass.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 17.8599, lng: 75.9864, address: 'NH-52 Highway, Solapur-Tuljapur Highway Corridor' },
        status: 'pending',
        statusNote: 'Pavement edge wear reported near toll plaza approach.',
        submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Awaiting site action.' }
        ]
    },
    {
        id: 'MH-2026-9950',
        name: 'Tukaram Sawant',
        phone: '9822991144',
        email: 'tukaram.s@gmail.com',
        description: 'Road milling and resurfacing finished on NH-65 Hadapsar-Loni Kalbhor stretch.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 18.4912, lng: 73.9851, address: 'NH-65 Highway, Hadapsar-Loni Kalbhor Stretch, Pune District' },
        status: 'resolved',
        statusNote: 'Asphalt milling and smooth resurfacing completed by PWD Highway Division.',
        submittedAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 32 * 3600 * 1000).toISOString(), note: 'Filed.' },
            { status: 'resolved', date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Resolved.' }
        ]
    },
    {
        id: 'MH-2026-9961',
        name: 'Dattatray Bhagat',
        phone: '9822448811',
        email: 'dattatray.b@gmail.com',
        description: 'Pothole patching active with motorized grader on NH-66 Mumbai-Goa Highway near Pen.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 18.6120, lng: 73.1250, address: 'NH-66 Mumbai-Goa Highway, Pen-Nagothane Section, Raigad' },
        status: 'in-progress',
        statusNote: 'Widening and pothole patching squad active with motorized grader.',
        submittedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 9 * 3600 * 1000).toISOString(), note: 'Reported.' },
            { status: 'in-progress', date: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), note: 'Active road machinery.' }
        ]
    },
    {
        id: 'MH-2026-9972',
        name: 'Anant Rane',
        phone: '9822661133',
        email: 'anant.rane@gmail.com',
        description: 'Bridge approach repair completed on NH-66 Chiplun River Bridge section.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 17.5320, lng: 73.5180, address: 'NH-66 Highway, Chiplun Bridge Approach, Ratnagiri District' },
        status: 'resolved',
        statusNote: 'Bridge approach concrete repair and asphalt smoothing complete.',
        submittedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), note: 'Bridge dip noted.' },
            { status: 'resolved', date: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), note: 'Smooth bridge ride restored.' }
        ]
    },
    {
        id: 'MH-2026-9983',
        name: 'Sudhir Salvi',
        phone: '9822339922',
        email: 'sudhir.s@gmail.com',
        description: 'Monsoon rutting and pothole cluster reported along NH-66 Ratnagiri Hathkhamba curve.',
        severity: 'critical',
        roadType: 'national-highway',
        location: { lat: 16.9902, lng: 73.3120, address: 'NH-66 Highway, Hathkhamba Bypass, Ratnagiri, Maharashtra' },
        status: 'pending',
        statusNote: 'Monsoon rutting reported along outer curve. Warning barricades placed.',
        submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Reported by ST Bus driver.' }
        ]
    },
    {
        id: 'MH-2026-9994',
        name: 'Maruti Suryavanshi',
        phone: '9822114488',
        email: 'maruti.s@gmail.com',
        description: 'Pavement patch and thermoplastic road markings completed on NH-361 Nanded Bypass.',
        severity: 'medium',
        roadType: 'national-highway',
        location: { lat: 19.0383, lng: 77.1210, address: 'NH-361 National Highway, Nanded Southern Bypass' },
        status: 'resolved',
        statusNote: 'Pavement patch and thermoplastic road markings completed.',
        submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Filed.' },
            { status: 'resolved', date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Inspected and certified.' }
        ]
    },
    {
        id: 'MH-2026-9995',
        name: 'Chandrashekhar Tiwari',
        phone: '9822774411',
        email: 'tiwari.c@gmail.com',
        description: 'Severe wheel-path depression from coal trucks on SH-267 Chandrapur-Ballarpur Corridor.',
        severity: 'critical',
        roadType: 'state-highway',
        location: { lat: 19.9215, lng: 79.3161, address: 'State Highway 267, Chandrapur-Ballarpur Heavy Haul Corridor' },
        status: 'pending',
        statusNote: 'Severe wheel-path depression from heavy mineral trucks. Scheduled for reconstruction.',
        submittedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), note: 'Queued in district PWD work register.' }
        ]
    }
];

function updateNearbyLocationComplaint(userLat, userLng) {
    if (!userLat || !userLng) return;
    try {
        const local = getStoredLocalComplaints();
        let existing = local.find(c => c.id === 'MH-2026-NEARBY-GPS');
        const nearbyCoords = {
            lat: parseFloat((userLat + 0.0016).toFixed(5)),
            lng: parseFloat((userLng + 0.0014).toFixed(5)),
            address: `Nearby Road (within 200m of your GPS location)`
        };
        if (!existing) {
            existing = {
                id: 'MH-2026-NEARBY-GPS',
                name: 'Live Citizen Reporter',
                phone: '9820011223',
                email: 'citizen.mh@gmail.com',
                description: 'Surface depression and road erosion detected near your current live location.',
                severity: 'high',
                roadType: 'municipal-road',
                location: nearbyCoords,
                status: 'in-progress',
                statusNote: 'PWD emergency repair squad notified for rapid patching.',
                submittedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    { status: 'pending', date: new Date(Date.now() - 3600 * 1000).toISOString(), note: 'Live location verified by citizen GPS.' },
                    { status: 'in-progress', date: new Date().toISOString(), note: 'Dispatched to local ward repair unit.' }
                ]
            };
            local.unshift(existing);
        } else {
            existing.location = nearbyCoords;
            existing.updatedAt = new Date().toISOString();
        }
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(local));

        // Attempt reverse geocoding to give a real street address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${nearbyCoords.lat}&lon=${nearbyCoords.lng}`)
            .then(r => r.json())
            .then(data => {
                if (data && data.display_name) {
                    existing.location.address = data.display_name.split(',').slice(0, 3).join(', ');
                    localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(local));
                }
            })
            .catch(() => {});

        if (typeof updateStats === 'function') updateStats();
        if (typeof renderRecentComplaints === 'function') renderRecentComplaints();
    } catch (e) {
        console.warn('Could not update nearby GPS complaint:', e);
    }
}

function getStoredLocalComplaints() {
    try {
        const raw = localStorage.getItem(LOCAL_COMPLAINTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalComplaintItem(c) {
    try {
        const list = getStoredLocalComplaints();
        list.unshift(c);
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn('Could not save to local storage:', e);
    }
}

// Helper: fetch with retry (handles server not-ready-yet on page load)
async function fetchWithRetry(url, options = {}, retries = 1, delayMs = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                throw error;
            }
        }
    }
}

async function getComplaints() {
    let apiData = [];
    try {
        apiData = await fetchWithRetry(`${API_BASE}/complaints`);
    } catch (error) {
        apiData = [];
    }

    const localItems = getStoredLocalComplaints();
    const baseItems = (apiData && apiData.length > 0) ? apiData : DEFAULT_COMPLAINTS;

    // Merge without duplicating IDs
    const seen = new Set();
    const merged = [];
    for (const item of [...localItems, ...baseItems]) {
        if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
        }
    }
    return merged;
}

async function addComplaint(complaint) {
    // Generate standard id if not present
    if (!complaint.id) {
        complaint.id = `MH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!complaint.submittedAt) {
        complaint.submittedAt = new Date().toISOString();
    }
    if (!complaint.status) {
        complaint.status = 'pending';
    }
    if (!complaint.statusHistory || !Array.isArray(complaint.statusHistory)) {
        complaint.statusHistory = [
            {
                status: complaint.status || 'pending',
                date: complaint.submittedAt || new Date().toISOString(),
                note: 'Complaint registered successfully by citizen. Queued for PWD field engineer inspection.'
            }
        ];
    }

    saveLocalComplaintItem(complaint);

    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(complaint)
        });
        if (response.ok) {
            const res = await response.json();
            return res;
        }
    } catch (error) {
        console.warn('API save offline, cached in localStorage:', error.message);
    }
    return complaint;
}

async function getComplaintById(id) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${id}`);
        if (response.ok) return await response.json();
    } catch (error) {
        // Fallback to local
    }
    const all = await getComplaints();
    return all.find(c => c.id.toLowerCase() === id.toLowerCase()) || null;
}

async function updateComplaintStatus(id, newStatus, note = '') {
    // Update local storage
    const localItems = getStoredLocalComplaints();
    const target = localItems.find(c => c.id === id);
    if (target) {
        target.status = newStatus;
        target.statusNote = note;
        target.updatedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(localItems));
    }

    try {
        const response = await fetch(`${API_BASE}/complaints/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, note })
        });
        if (response.ok) return await response.json();
    } catch (error) {
        console.warn('API update offline, saved locally');
    }
    return { success: true, id, status: newStatus };
}

async function updateComplaintDetails(id, updates = {}) {
    const localItems = getStoredLocalComplaints();
    let target = localItems.find(c => c.id === id);
    if (!target) {
        const base = DEFAULT_COMPLAINTS.find(c => c.id === id);
        if (base) {
            target = JSON.parse(JSON.stringify(base));
            localItems.unshift(target);
        }
    }
    if (target) {
        if (updates.description !== undefined) target.description = updates.description;
        if (updates.severity !== undefined) target.severity = updates.severity;
        target.updatedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(localItems));
    }
    return { success: true, id };
}

// Stats are now computed on the backend
async function getStats() {
    try {
        return await fetchWithRetry(`${API_BASE}/stats`);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { total: 0, pending: 0, inProgress: 0, resolved: 0, critical: 0 };
    }
}

function isAdminLoggedIn() { return sessionStorage.getItem(ADMIN_KEY) === 'true'; }
function adminLogin(u, p) {
    if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
        sessionStorage.setItem(ADMIN_KEY, 'true'); return true;
    }
    return false;
}
function adminLogout() {
    sessionStorage.removeItem(ADMIN_KEY);
    if (typeof resetMapToMaharashtraView === 'function') {
        resetMapToMaharashtraView();
    }
    if (typeof resetAllLoginForms === 'function') {
        resetAllLoginForms();
    }
}

// seedDemoData logic removed since backend handles db seeding via schema.sql
