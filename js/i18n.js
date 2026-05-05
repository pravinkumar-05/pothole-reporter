// ============================================================
// I18N.JS — Multi-language Support (English, Hindi, Marathi)
// ============================================================

const translations = {
    en: {
        lang_gov: "Government of Maharashtra | Public Works Department",
        lang_select: "Language:",
        brand_name: "RoadGuard Maharashtra",
        brand_sub: "Government of Maharashtra Initiative",
        nav_home: "Home",
        nav_track: "Track Complaint",
        nav_dash: "Admin Dashboard",
        nav_about: "About",
        nav_report: "📸 Report Pothole",
        hero_title: "Report Road Damage.<br><span class='highlight'>Get It Fixed.</span>",
        hero_highlight: "Get It Fixed.",
        hero_desc: "Empowering citizens of Maharashtra to report potholes and road damage instantly. Upload a photo, pin the location, and track repair progress in real-time.",
        hero_report: "📸 Report a Pothole",
        hero_track: "🔍 Track Complaint",
        card_total: "Total Reports",
        card_resolved: "Resolved",
        stat_total: "Total Complaints",
        stat_pending: "Pending",
        stat_progress: "In Progress",
        stat_resolved: "Resolved",
        how_title: "How It Works",
        how_sub: "Report road damage in 4 simple steps",
        step1_title: "Capture Photo",
        step1_desc: "Take a photo of the pothole or road damage using your phone camera",
        step2_title: "Pin Location",
        step2_desc: "Auto-detect your GPS location or manually pin it on the map",
        step3_title: "Fill Details",
        step3_desc: "Describe the damage, select severity level and road type",
        step4_title: "Submit & Track",
        step4_desc: "Get a unique complaint ID and track repair progress in real-time",
        recent_title: "Recent Complaints",
        recent_sub: "Latest pothole reports across Maharashtra",
        
        // Report Page
        report_page_title: "Report a Pothole",
        report_page_sub: "Help us fix Maharashtra's roads — report damage in minutes",
        w_photo: "Photo",
        w_loc: "Location",
        w_det: "Details",
        w_sub: "Submit",
        upload_title: "Upload or Capture Photo",
        upload_desc: "Drag & drop an image here, or click to browse",
        btn_cam: "📸 Open Camera",
        btn_loc: "📍 Auto-Detect My Location",
        lbl_name: "Full Name",
        lbl_phone: "Phone Number",
        lbl_email: "Email Address",
        lbl_sev: "Severity",
        lbl_type: "Road Type",
        lbl_desc: "Description",
        btn_n_loc: "Next: Location →",
        btn_n_det: "Next: Details →",
        btn_r_sub: "Review & Submit →",
        btn_submit: "🚀 Submit Complaint",
        rev_title: "Review Your Report",

        // Track Page
        track_page_title: "Track Your Complaint",
        track_page_sub: "Enter your complaint ID to check the current status",
        track_placeholder: "Enter Complaint ID (e.g., MH-RD-DEMO01)",
        btn_track: "🔍 Track",

        // Dashboard
        login_title: "Admin Login",
        login_sub: "Access the complaint management dashboard",
        lbl_user: "Username",
        lbl_pass: "Password",
        btn_login: "Login",
        dash_title: "Complaint Dashboard",
        dash_sub: "Manage & resolve citizen complaints",
        btn_out: "🚪 Logout",
        th_id: "ID",
        th_name: "Complainant",
        th_loc: "Location",
        th_sev: "Severity",
        th_status: "Status",
        th_date: "Date",
        th_act: "Action",

        // About Page
        about_t: "About <span style='color:var(--saffron)'>RoadGuard Maharashtra</span>",
        about_p1: "RoadGuard Maharashtra is a citizen-driven initiative by the Government of Maharashtra under the Smart India Hackathon (SIH) program. Our mission is to create safer roads by empowering citizens to report road damage quickly and efficiently.",
        about_p2: "Every complaint is reviewed by the Public Works Department (PWD) and routed to the appropriate municipal authority for timely repair. Citizens can track the progress of their complaint in real-time.",
        f1_t: "Photo Evidence", f1_d: "Upload images for faster verification",
        f2_t: "GPS Location", f2_d: "Accurate pinpointing via maps",
        f3_t: "Real-time Tracking", f3_d: "Track complaint status live",
        f4_t: "Govt. Backed", f4_d: "Official Maharashtra initiative",
        
        status_pending: "Pending", status_under_review: "Under Review", status_in_progress: "In Progress", status_resolved: "Resolved", status_rejected: "Rejected",
        btn_view: "View"
    },
    hi: {
        lang_gov: "महाराष्ट्र सरकार | लोक निर्माण विभाग",
        lang_select: "भाषा:",
        brand_name: "रोडगार्ड महाराष्ट्र",
        brand_sub: "महाराष्ट्र सरकार की पहल",
        nav_home: "होम",
        nav_track: "शिकायत ट्रैक करें",
        nav_dash: "एडमिन डैशबोर्ड",
        nav_about: "हमारे बारे में",
        nav_report: "📸 गड्ढा रिपोर्ट करें",
        hero_title: "सड़क की क्षति रिपोर्ट करें।<br><span class='highlight'>मरम्मत करवाएं।</span>",
        hero_highlight: "मरम्मत करवाएं।",
        hero_desc: "महाराष्ट्र के नागरिकों को गड्ढों और सड़क क्षति की तुरंत रिपोर्ट करने के लिए सशक्त बनाना। फोटो अपलोड करें, स्थान चिह्नित करें, और मरम्मत की प्रगति को रियल-टाइम में ट्रैक करें।",
        hero_report: "📸 गड्ढा रिपोर्ट करें",
        hero_track: "🔍 शिकायत ट्रैक करें",
        card_total: "कुल रिपोर्ट",
        card_resolved: "हल किए गए",
        stat_total: "कुल शिकायतें",
        stat_pending: "लंबित",
        stat_progress: "प्रगति में",
        stat_resolved: "हल किए गए",
        how_title: "यह कैसे काम करता है",
        how_sub: "4 आसान चरणों में सड़क क्षति की रिपोर्ट करें",
        step1_title: "फोटो खींचें",
        step1_desc: "अपने फोन कैमरे से गड्ढे या सड़क क्षति की फोटो लें",
        step2_title: "स्थान चिन्हित करें",
        step2_desc: "अपना GPS स्थान स्वतः पता लगाएं या मैप पर मैन्युअली पिन करें",
        step3_title: "विवरण भरें",
        step3_desc: "क्षति का वर्णन करें, गंभीरता स्तर और सड़क प्रकार चुनें",
        step4_title: "सबमिट और ट्रैक करें",
        step4_desc: "एक यूनिक शिकायत आईडी प्राप्त करें और रियल-टाइम में मरम्मत प्रगति ट्रैक करें",
        recent_title: "हालिया शिकायतें",
        recent_sub: "महाराष्ट्र भर से नवीनतम गड्ढा रिपोर्ट",

        // Report Page
        report_page_title: "गड्ढा रिपोर्ट करें",
        report_page_sub: "महाराष्ट्र की सड़कों को सुधारने में हमारी मदद करें — मिनटों में क्षति की रिपोर्ट करें",
        w_photo: "फोटो", w_loc: "स्थान", w_det: "विवरण", w_sub: "सबमिट",
        upload_title: "फोटो अपलोड या कैप्चर करें",
        upload_desc: "यहां चित्र खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
        btn_cam: "📸 कैमरा खोलें",
        btn_loc: "📍 मेरा स्थान स्वतः पता लगाएं",
        lbl_name: "पूरा नाम", lbl_phone: "फोन नंबर", lbl_email: "ईमेल पता",
        lbl_sev: "गंभीरता", lbl_type: "सड़क का प्रकार", lbl_desc: "विवरण",
        btn_n_loc: "अगला: स्थान →", btn_n_det: "अगला: विवरण →", btn_r_sub: "समीक्षा और सबमिट →",
        btn_submit: "🚀 शिकायत दर्ज करें",
        rev_title: "अपनी रिपोर्ट की समीक्षा करें",

        // Track Page
        track_page_title: "अपनी शिकायत ट्रैक करें",
        track_page_sub: "वर्तमान स्थिति की जांच करने के लिए अपनी शिकायत आईडी दर्ज करें",
        track_placeholder: "शिकायत आईडी दर्ज करें (उदा., MH-RD-DEMO01)",
        btn_track: "🔍 ट्रैक करें",

        // Dashboard
        login_title: "एडमिन लॉगिन",
        login_sub: "शिकायत प्रबंधन डैशबोर्ड तक पहुंचें",
        lbl_user: "उपयोगकर्ता नाम", lbl_pass: "पासवर्ड", btn_login: "लॉगिन",
        dash_title: "शिकायत डैशबोर्ड", dash_sub: "नागरिक शिकायतों का प्रबंधन और समाधान",
        btn_out: "🚪 लॉगआउट",
        th_id: "आईडी", th_name: "शिकायतकर्ता", th_loc: "स्थान", th_sev: "गंभीरता", th_status: "स्थिति", th_date: "तारीख", th_act: "कार्रवाई",

        // About Page
        about_t: "<span style='color:var(--saffron)'>रोडगार्ड महाराष्ट्र</span> के बारे में",
        about_p1: "रोडगार्ड महाराष्ट्र स्मार्ट इंडिया हैकथॉन (SIH) कार्यक्रम के तहत महाराष्ट्र सरकार की एक नागरिक-संचालित पहल है। हमारा मिशन नागरिकों को सड़क क्षति की जल्दी और कुशलता से रिपोर्ट करने के लिए सशक्त बनाकर सुरक्षित सड़कें बनाना है।",
        about_p2: "प्रत्येक शिकायत की लोक निर्माण विभाग (PWD) द्वारा समीक्षा की जाती है और समय पर मरम्मत के लिए उपयुक्त नगर निगम प्राधिकरण को भेजी जाती है। नागरिक अपनी शिकायत की प्रगति को रियल-टाइम में ट्रैक कर सकते हैं।",
        f1_t: "फोटो सबूत", f1_d: "तेजी से सत्यापन के लिए चित्र अपलोड करें",
        f2_t: "GPS स्थान", f2_d: "मैप्स के माध्यम से सटीक पिनपॉइंटिंग",
        f3_t: "रियल-टाइम ट्रैकिंग", f3_d: "शिकायत स्थिति लाइव ट्रैक करें",
        f4_t: "सरकार समर्थित", f4_d: "आधिकारिक महाराष्ट्र पहल",
        
        status_pending: "लंबित", status_under_review: "समीक्षाधीन", status_in_progress: "प्रगति में", status_resolved: "हल किया गया", status_rejected: "अस्वीकृत",
        btn_view: "देखें"
    },
    mr: {
        lang_gov: "महाराष्ट्र शासन | सार्वजनिक बांधकाम विभाग",
        lang_select: "भाषा:",
        brand_name: "रोडगार्ड महाराष्ट्र",
        brand_sub: "महाराष्ट्र शासनाचा उपक्रम",
        nav_home: "मुख्यपृष्ठ",
        nav_track: "तक्रार ट्रॅक करा",
        nav_dash: "ॲडमिन डॅशबोर्ड",
        nav_about: "आमच्याबद्दल",
        nav_report: "📸 खड्डा नोंदवा",
        hero_title: "रस्त्याचे नुकसान नोंदवा.<br><span class='highlight'>दुरुस्ती करवा.</span>",
        hero_highlight: "दुरुस्ती करवा.",
        hero_desc: "महाराष्ट्रातील नागरिकांना खड्डे आणि रस्त्यांच्या नुकसानीची त्वरित तक्रार करण्यासाठी सक्षम करणे. फोटो अपलोड करा, स्थान निश्चित करा आणि दुरुस्तीच्या प्रगतीचा रिअल-टाइम मागोवा घ्या.",
        hero_report: "📸 खड्डा नोंदवा",
        hero_track: "🔍 तक्रार ट्रॅक करा",
        card_total: "एकूण तक्रारी",
        card_resolved: "निराकरण झाले",
        stat_total: "एकूण तक्रारी",
        stat_pending: "प्रलंबित",
        stat_progress: "प्रगतीमध्ये",
        stat_resolved: "निराकरण झाले",
        how_title: "हे कसे कार्य करते",
        how_sub: "4 सोप्या पायऱ्यांमध्ये रस्त्याच्या नुकसानीची तक्रार करा",
        step1_title: "फोटो काढा",
        step1_desc: "तुमच्या फोन कॅमेऱ्याने खड्डा किंवा रस्त्याच्या नुकसानीचा फोटो काढा",
        step2_title: "स्थान निश्चित करा",
        step2_desc: "तुमचे GPS स्थान आपोआप शोधा किंवा नकाशावर मॅन्युअली पिन करा",
        step3_title: "तपशील भरा",
        step3_desc: "नुकसानीचे वर्णन करा, तीव्रता पातळी आणि रस्त्याचा प्रकार निवडा",
        step4_title: "सबमिट आणि ट्रॅक करा",
        step4_desc: "एक युनिक तक्रार आयडी मिळवा आणि रिअल-टाइम मध्ये दुरुस्तीच्या प्रगतीचा मागोवा घ्या",
        recent_title: "अलीकडील तक्रारी",
        recent_sub: "महाराष्ट्रभरातील नवीनतम खड्ड्यांच्या तक्रारी",

        // Report Page
        report_page_title: "खड्डा नोंदवा",
        report_page_sub: "महाराष्ट्राचे रस्ते दुरुस्त करण्यात आम्हाला मदत करा — काही मिनिटांत नुकसानीची तक्रार करा",
        w_photo: "फोटो", w_loc: "स्थान", w_det: "तपशील", w_sub: "सबमिट",
        upload_title: "फोटो अपलोड किंवा कॅप्चर करा",
        upload_desc: "येथे चित्र ड्रॅग आणि ड्रॉप करा किंवा ब्राउझ करण्यासाठी क्लिक करा",
        btn_cam: "📸 कॅमेरा उघडा",
        btn_loc: "📍 माझे स्थान आपोआप शोधा",
        lbl_name: "पूर्ण नाव", lbl_phone: "फोन नंबर", lbl_email: "ईमेल पत्ता",
        lbl_sev: "तीव्रता", lbl_type: "रस्त्याचा प्रकार", lbl_desc: "वर्णन",
        btn_n_loc: "पुढील: स्थान →", btn_n_det: "पुढील: तपशील →", btn_r_sub: "पुनरावलोकन आणि सबमिट करा →",
        btn_submit: "🚀 तक्रार नोंदवा",
        rev_title: "तुमच्या अहवालाचे पुनरावलोकन करा",

        // Track Page
        track_page_title: "तुमची तक्रार ट्रॅक करा",
        track_page_sub: "सद्यस्थिती तपासण्यासाठी तुमचा तक्रार आयडी प्रविष्ट करा",
        track_placeholder: "तक्रार आयडी प्रविष्ट करा (उदा. MH-RD-DEMO01)",
        btn_track: "🔍 ट्रॅक करा",

        // Dashboard
        login_title: "ॲडमिन लॉगिन",
        login_sub: "तक्रार व्यवस्थापन डॅशबोर्डवर प्रवेश करा",
        lbl_user: "वापरकर्तानाव", lbl_pass: "पासवर्ड", btn_login: "लॉगिन",
        dash_title: "तक्रार डॅशबोर्ड", dash_sub: "नागरिकांच्या तक्रारींचे व्यवस्थापन आणि निराकरण",
        btn_out: "🚪 लॉगआउट",
        th_id: "आयडी", th_name: "तक्रारदार", th_loc: "स्थान", th_sev: "तीव्रता", th_status: "स्थिती", th_date: "तारीख", th_act: "कृती",

        // About Page
        about_t: "<span style='color:var(--saffron)'>रोडगार्ड महाराष्ट्र</span> बद्दल",
        about_p1: "रोडगार्ड महाराष्ट्र हा स्मार्ट इंडिया हॅकेथॉन (SIH) कार्यक्रमांतर्गत महाराष्ट्र शासनाचा नागरिकांद्वारे चालवला जाणारा उपक्रम आहे. नागरिकांना रस्त्यांच्या नुकसानीची जलद आणि प्रभावीपणे तक्रार करण्यास सक्षम करून सुरक्षित रस्ते निर्माण करणे हे आमचे ध्येय आहे.",
        about_p2: "प्रत्येक तक्रारीचे सार्वजनिक बांधकाम विभाग (PWD) द्वारे पुनरावलोकन केले जाते आणि वेळेवर दुरुस्तीसाठी योग्य महानगरपालिका प्राधिकरणाकडे पाठविले जाते. नागरिक त्यांच्या तक्रारीच्या प्रगतीचा रिअल-टाइममध्ये मागोवा घेऊ शकतात.",
        f1_t: "फोटो पुरावा", f1_d: "जलद पडताळणीसाठी प्रतिमा अपलोड करा",
        f2_t: "GPS स्थान", f2_d: "नकाशांद्वारे अचूक पिनपॉइंटिंग",
        f3_t: "रिअल-टाइम ट्रॅकिंग", f3_d: "तक्रारीची स्थिती थेट ट्रॅक करा",
        f4_t: "शासनाचे पाठबळ", f4_d: "अधिकृत महाराष्ट्र उपक्रम",
        
        status_pending: "प्रलंबित", status_under_review: "पुनरावलोकनाधीन", status_in_progress: "प्रगतीमध्ये", status_resolved: "निराकरण झाले", status_rejected: "नाकारले",
        btn_view: "पहा"
    }
};

// Export t function for dynamic text translation in JS
function t(key) {
    const lang = document.body.getAttribute('data-lang') || 'en';
    return translations[lang] && translations[lang][key] ? translations[lang][key] : key;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = dict[key];
            } else {
                el.innerHTML = dict[key];
            }
        }
    });

    // Also dispatch custom event for dynamic components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// Set language and update UI
function setLanguage(lang) {
    document.body.setAttribute('data-lang', lang);
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.lang-btn[onclick="setLanguage('${lang}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    // Apply translations
    applyTranslations(lang);
    // Persist
    localStorage.setItem('roadguard_lang', lang);
}

// Init language on load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('roadguard_lang') || 'en';
    setLanguage(savedLang);
});
