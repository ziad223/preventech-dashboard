    // ---- Reusable Custom Toast System (Replaces Native alert) ----
    function showToast(title, message, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast-card toast-${type}`;

      const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'danger' ? '❌' : 'ℹ️';
      const iconBg = type === 'success' ? 'rgba(46,189,133,0.14)' : type === 'danger' ? 'rgba(255,82,82,0.14)' : 'rgba(151,80,255,0.14)';
      const iconColor = type === 'success' ? 'var(--success)' : type === 'danger' ? 'var(--danger)' : 'var(--purple-deep)';

      toast.innerHTML = `
      <div style="width:40px; height:40px; border-radius:12px; background:${iconBg}; color:${iconColor}; display:flex; align-items:center; justify-content:center; font-size:1.15rem; flex:none;">
        ${icon}
      </div>
      <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
        <b style="font-size:.92rem; font-weight:800; color:var(--ink);">${title}</b>
        <span style="font-size:.82rem; color:var(--ink-soft); line-height:1.3;">${message}</span>
      </div>
      <button class="close-toast-btn" style="font-size:1.1rem; opacity:.6; cursor:pointer; background:none; border:none; color:var(--ink);">✕</button>
    `;

      toast.querySelector('.close-toast-btn').onclick = () => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
      };

      container.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) {
          toast.classList.add('toast-exit');
          setTimeout(() => toast.remove(), 300);
        }
      }, 4200);
    }

    // ---- Reusable Custom Confirm System (Replaces Native confirm) ----
    function showConfirm(title, message, onConfirm) {
      const modal = document.getElementById('customConfirmModal');
      const titleEl = document.getElementById('confirmTitle');
      const msgEl = document.getElementById('confirmMessage');
      const okBtn = document.getElementById('confirmOkBtn');
      const cancelBtn = document.getElementById('confirmCancelBtn');

      if (!modal) return;
      titleEl.textContent = title;
      msgEl.textContent = message;
      modal.classList.add('open');

      const cleanup = () => {
        modal.classList.remove('open');
        okBtn.onclick = null;
        cancelBtn.onclick = null;
      };

      okBtn.onclick = () => {
        cleanup();
        if (onConfirm) onConfirm();
      };
      cancelBtn.onclick = cleanup;
    }

    // ---- Logout Button Handler ----
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        const isAr = document.body.classList.contains('lang-ar');
        showConfirm(
          isAr ? 'تأكيد تسجيل الخروج' : 'Confirm Sign Out',
          isAr ? 'هل أنت تأكد من الخروج من لوحة تحكم PrevenTech والعودة لشاشة الدخول؟' : 'Are you sure you want to sign out of PrevenTech Dashboard?',
          () => {
            showToast(isAr ? 'تم تسجيل الخروج' : 'Signed Out', isAr ? 'جاري إغلاق الجلسة والعودة للشاشة الرئيسية...' : 'Redirecting to sign-in page...', 'success');
            setTimeout(() => location.reload(), 1500);
          }
        );
      });
    }

    // ---- SPA Navigation Tabs ----
    function initNavTriggers() {
      const navTriggers = document.querySelectorAll('.sidebar .nav-item, .nav-trigger');
      const pageViews = document.querySelectorAll('.page-view');

      navTriggers.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const targetTab = item.getAttribute('data-tab');
          if (!targetTab) return;

          document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
          const activeNav = document.querySelector(`.sidebar .nav-item[data-tab="${targetTab}"]`);
          if (activeNav) activeNav.classList.add('active');

          pageViews.forEach(view => {
            view.classList.remove('active');
            if (view.id === `view-${targetTab}`) {
              view.classList.add('active');
              if (targetTab === 'cms' && typeof loadCmsFromStorage === 'function') {
                loadCmsFromStorage();
              }
            }
          });

          // Mobile close sidebar
          if (window.innerWidth <= 1024) {
            const sb = document.getElementById('sidebar');
            if (sb) sb.classList.remove('open');
          }
        });
      });
    }
    initNavTriggers();

    // ---- Sidebar Toggle & Close (Mobile / Tablet) ----
    const toggleSidebar = document.getElementById('toggleSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');

    if (toggleSidebar && sidebar) {
      toggleSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });
    }

    if (closeSidebarBtn && sidebar) {
      closeSidebarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.remove('open');
      });
    }

    // ---- Theme Toggle (Light / Dark) ----
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const iconSun = themeToggle.querySelector('.icon-sun');
    const iconMoon = themeToggle.querySelector('.icon-moon');

    function applyTheme(mode) {
      html.setAttribute('data-theme', mode);
      if (mode === 'dark') {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
      } else {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
      }
      try { localStorage.setItem('preventech-dash-theme', mode); } catch (e) { }
    }

    let savedTheme = null;
    try { savedTheme = localStorage.getItem('preventech-dash-theme'); } catch (e) { }
    applyTheme(savedTheme || 'dark');

    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // ---- Language Toggle (AR / EN) ----
    const body = document.body;
    const langToggle = document.getElementById('langToggle');
    const sidebarLangToggle = document.getElementById('sidebarLangToggle');

    function toggleLanguage() {
      const isAr = body.classList.contains('lang-ar');
      if (isAr) {
        body.classList.remove('lang-ar'); body.classList.add('lang-en');
        html.setAttribute('lang', 'en'); html.setAttribute('dir', 'ltr');
        document.querySelectorAll('.lang-toggle').forEach(el => {
          el.querySelector('[data-lang="en"]').classList.add('active');
          el.querySelector('[data-lang="ar"]').classList.remove('active');
        });
      } else {
        body.classList.remove('lang-en'); body.classList.add('lang-ar');
        html.setAttribute('lang', 'ar'); html.setAttribute('dir', 'rtl');
        document.querySelectorAll('.lang-toggle').forEach(el => {
          el.querySelector('[data-lang="ar"]').classList.add('active');
          el.querySelector('[data-lang="en"]').classList.remove('active');
        });
      }
    }

    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
    if (sidebarLangToggle) sidebarLangToggle.addEventListener('click', toggleLanguage);

    // ---- Sidebar Logout Button ----
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener('click', () => {
        const isAr = body.classList.contains('lang-ar');
        showConfirm(
          isAr ? 'تأكيد تسجيل الخروج' : 'Confirm Sign Out',
          isAr ? 'هل أنت تأكد من تسجيل الخروج من جلسة النظام الخاصة بك؟' : 'Are you sure you want to sign out of your current session?',
          () => {
            showToast(
              isAr ? 'تم تسجيل الخروج' : 'Signed Out',
              isAr ? 'تم إنهاء الجلسة بنجاح.' : 'Session ended successfully.',
              'info'
            );
          }
        );
      });
    }

    // ---- Modal Viewer Logic ----
    const scanModal = document.getElementById('scanModal');
    const closeModal = document.getElementById('closeModal');
    const modalPatientName = document.getElementById('modalPatientName');

    function initScanBtns() {
      document.querySelectorAll('.open-scan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = btn.getAttribute('data-name');
          const isAr = document.body.classList.contains('lang-ar');
          modalPatientName.textContent = isAr ? `تقرير فحص المريض: ${name}` : `Patient Scan Report: ${name}`;
          scanModal.classList.add('open');
        });
      });
    }
    initScanBtns();

    closeModal.addEventListener('click', () => scanModal.classList.remove('open'));
    scanModal.addEventListener('click', (e) => { if (e.target === scanModal) scanModal.classList.remove('open'); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (scanModal) scanModal.classList.remove('open');
        if (dailyReportModal) dailyReportModal.classList.remove('open');
        if (recordDetailsModal) recordDetailsModal.classList.remove('open');
      }
    });

    // ---- Daily Executive PDF Report Modal Logic ----
    const dailyReportModal = document.getElementById('dailyReportModal');
    const openDailyReportBtn = document.getElementById('openDailyReportBtn');
    const closeDailyReportModal = document.getElementById('closeDailyReportModal');

    if (openDailyReportBtn && dailyReportModal) {
      openDailyReportBtn.addEventListener('click', () => {
        const isAr = document.body.classList.contains('lang-ar');
        showToast(isAr ? 'توليد التقرير السريري' : 'Generating Report', isAr ? 'جاري إعداد وتأطير التقرير التنفيذي اليومي بصيغة PDF...' : 'Preparing daily executive PDF report...', 'info');
        dailyReportModal.classList.add('open');
      });
    }

    if (closeDailyReportModal) {
      closeDailyReportModal.addEventListener('click', () => dailyReportModal.classList.remove('open'));
    }
    if (dailyReportModal) {
      dailyReportModal.addEventListener('click', (e) => { if (e.target === dailyReportModal) dailyReportModal.classList.remove('open'); });
    }

    // ---- New Consultation Modal & Save Engine ----
    const newConsultationModal = document.getElementById('newConsultationModal');
    const openNewConsultationBtn = document.getElementById('openNewConsultationBtn');
    const closeNewConsultationModal = document.getElementById('closeNewConsultationModal');
    const cancelConsultationBtn = document.getElementById('cancelConsultationBtn');

    if (openNewConsultationBtn && newConsultationModal) {
      openNewConsultationBtn.addEventListener('click', () => {
        newConsultationModal.classList.add('open');
      });
    }

    [closeNewConsultationModal, cancelConsultationBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', () => newConsultationModal.classList.remove('open'));
    });

    if (newConsultationModal) {
      newConsultationModal.addEventListener('click', (e) => { if (e.target === newConsultationModal) newConsultationModal.classList.remove('open'); });
    }

    function saveNewConsultation() {
      const clientNameInput = document.getElementById('consultClientName');
      const clientName = clientNameInput ? clientNameInput.value.trim() : '';
      const topic = document.getElementById('consultTopic').value;
      const date = document.getElementById('consultDate').value;
      const time = document.getElementById('consultTime').value;
      const doctor = document.getElementById('consultDoctor').value;
      const isAr = document.body.classList.contains('lang-ar');

      if (!clientName) {
        showToast(isAr ? 'خطأ في المدخلات' : 'Validation Error', isAr ? 'الرجاء كتابة اسم الجهة الصحية أو العميل.' : 'Please enter facility/client name.', 'danger');
        return;
      }

      const tbody = document.querySelector('#view-consultations table.data-table tbody');
      if (tbody) {
        const newRow = document.createElement('tr');
        newRow.style.animation = 'fadeIn 0.3s ease';
        newRow.innerHTML = `
        <td>
          <b>${clientName}</b><br>
          <span style="font-size:.76rem;color:var(--ink-soft);">${clientName} • New Booking</span>
        </td>
        <td>${topic}</td>
        <td>${date} • ${time}</td>
        <td>${doctor}</td>
        <td><span class="status-tag status-confirmed"><span class="t-ar">● مؤكدة جديدة</span><span class="t-en">● Confirmed</span></span></td>
        <td><button class="btn-action" onclick="showToast('بدء الجلسة الافتراضية', 'جاري الربط والاتصال بقاعة الاجتماعات المباشرة...', 'info');" style="background:var(--grad); color:#fff;"><span class="t-ar">بدء الجلسة الافتراضية 🎥</span><span class="t-en">Launch Session 🎥</span></button></td>
      `;
        tbody.insertBefore(newRow, tbody.firstChild);
      }

      // Update count stats
      const totalStat = document.querySelector('#view-consultations .stat-val');
      if (totalStat) {
        const current = parseInt(totalStat.textContent, 10) || 86;
        totalStat.textContent = current + 1;
      }

      newConsultationModal.classList.remove('open');
      document.getElementById('newConsultationForm').reset();

      showToast(
        isAr ? 'جدولة استشارة جديدة 📅' : 'Consultation Scheduled 📅',
        isAr ? `تم حفظ وتأكيد موعد الاستشارة مع (${clientName}) بنجاح وإضافتها لجدول المواعيد!` : `Consultation with ${clientName} scheduled successfully!`,
        'success'
      );
    }

    // ---- Direct PDF Download Generator via html2pdf.js ----
    function downloadDailyReportPDF() {
      const reportElement = document.getElementById('dailyReportPrintContent');
      if (!reportElement) return;

      const isAr = document.body.classList.contains('lang-ar');
      showToast(isAr ? 'جاري التنزيل المباشر' : 'Direct Download Started', isAr ? 'جاري معالجة المستند وتنزيل ملف PDF المباشر على جهازك...' : 'Processing document and downloading PDF file...', 'info');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: 'PrevenTech_Daily_Executive_Report_2026-07-25.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#FFFFFF' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(reportElement).save().then(() => {
          showToast(isAr ? 'تم التنزيل بنجاح 📥' : 'Download Complete 📥', isAr ? 'تم حفظ ملف PDF المباشر بنجاح على جهازك!' : 'PDF file downloaded successfully!', 'success');
        }).catch(err => {
          console.error('PDF export error:', err);
          window.print();
        });
      } else {
        window.print();
      }
    }

    // ---- Functional Excel Export Engine ----
    function downloadExcelReport() {
      const isAr = document.body.classList.contains('lang-ar');

      const exportScans = [
        { id: 'PT-9841', name: 'عبدالله المطيري', nameEn: 'Abdullah Al-Mutairi', age: 58, gender: 'Male', facility: 'مستشفى الملك فيصل التخصصي', facilityEn: 'King Faisal Specialist Hospital', thermal: '38.4°C', risk: 'عالي الخطورة / High Risk', recommendation: 'إحالة عاجلة لعيادة الأوعية وتخفيف الضغط' },
        { id: 'PT-9840', name: 'منى الشمري', nameEn: 'Mona Al-Shammari', age: 62, gender: 'Female', facility: 'مستشفى السلام الدولي', facilityEn: 'Al-Salam International Hospital', thermal: '36.8°C', risk: 'متوسط الخطورة / Moderate Risk', recommendation: 'استشارة متابعة خلال 7 أيام' },
        { id: 'PT-9839', name: 'خالد القحطاني', nameEn: 'Khaled Al-Qahtani', age: 51, gender: 'Male', facility: 'مجموعة الرعاية الصحية الأولى', facilityEn: 'First Healthcare Group', thermal: '35.9°C', risk: 'منخفض / Normal', recommendation: 'فحص دوري بعد 6 أشهر' },
        { id: 'PT-9838', name: 'فاطمة الزهراني', nameEn: 'Fatima Al-Zahrani', age: 67, gender: 'Female', facility: 'مستشفى الملك فيصل التخصصي', facilityEn: 'King Faisal Specialist Hospital', thermal: '38.1°C', risk: 'عالي الخطورة / High Risk', recommendation: 'إحالة فورية للعيادة السكرية' },
        { id: 'PT-9837', name: 'عمر الغامدي', nameEn: 'Omar Al-Ghamdi', age: 49, gender: 'Male', facility: 'مستشفى السلام الدولي', facilityEn: 'Al-Salam International Hospital', thermal: '36.2°C', risk: 'منخفض / Normal', recommendation: 'متابعة روتينية' }
      ];

      let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic compatibility in Excel
      csvContent += 'رقم الفحص (Scan ID),اسم المريض (Patient Name),العمر والجنس (Age/Gender),المنشأة الطبية (Facility),المؤشر الحراري (Thermal °C),درجة الخطورة (Risk Level),التوصية السريرية (Clinical Action)\n';

      exportScans.forEach(row => {
        const name = isAr ? row.name : row.nameEn;
        const facility = isAr ? row.facility : row.facilityEn;
        csvContent += `"${row.id}","${name}","${row.age} ${row.gender}","${facility}","${row.thermal}","${row.risk}","${row.recommendation}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `PrevenTech_Mo'eenTech_AI_Scans_2026-07-25.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        isAr ? 'تصدير سجل الفحوصات 📊' : 'Excel Export Completed 📊',
        isAr ? 'تم توليد وتنزيل ملف Excel الكامل لنتائج فحوصات Mo\'eenTech AI بنجاح على جهازك!' : 'Mo\'eenTech AI Scans dataset downloaded as Excel file!',
        'success'
      );
    }

    // ---- Search Instant Dropdown Data & Logic ----
    const searchData = [
      { type: 'patient', name: 'عبدالله المطيري', nameEn: 'Abdullah Al-Mutairi', info: 'فحص قدم سكرية - عالي الخطورة #PT-9841', action: 'scan', risk: 'high' },
      { type: 'patient', name: 'منى الشمري', nameEn: 'Mona Al-Shammari', info: 'فحص قدم سكرية - متوسط الخطورة #PT-9840', action: 'scan', risk: 'medium' },
      { type: 'patient', name: 'خالد القحطاني', nameEn: 'Khaled Al-Qahtani', info: 'فحص دوري - منخفض الخطورة #PT-9839', action: 'scan', risk: 'low' },
      { type: 'patient', name: 'فاطمة الزهراني', nameEn: 'Fatima Al-Zahrani', info: 'فحص قدم سكرية - عالي الخطورة #PT-9838', action: 'scan', risk: 'high' },
      { type: 'booking', name: 'مستشفى السلام الدولي', nameEn: 'Al-Salam International Hospital', info: 'استشارة دمج نظام Mo\'eenTech - مؤكدة', action: 'tab', tab: 'consultations' },
      { type: 'booking', name: 'مجموعة الرعاية الصحية الأولى', nameEn: 'First Healthcare Group', info: 'استشارة تحول رقمي - قيد الانتظار', action: 'tab', tab: 'consultations' },
      { type: 'lead', name: 'د. محمد العمري', nameEn: 'Dr. Mohammed Al-Omari', info: 'طلب عرض توضيحي لباقة المنشآت الطبية', action: 'tab', tab: 'leads' },
      { type: 'facility', name: 'مستشفى الملك فيصل التخصصي', nameEn: 'King Faisal Specialist Hospital', info: 'شريك صحي معتمد - 450 فحص', action: 'tab', tab: 'overview' },
    ];

    const searchInput = document.getElementById('searchInput');
    const searchInputEn = document.getElementById('searchInputEn');
    const searchDropdown = document.getElementById('searchDropdown');
    const mobileSearchModal = document.getElementById('mobileSearchModal');
    const closeMobileSearchModal = document.getElementById('closeMobileSearchModal');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mobileSearchInputEn = document.getElementById('mobileSearchInputEn');
    const mobileSearchDropdown = document.getElementById('mobileSearchDropdown');

    if (closeMobileSearchModal) {
      closeMobileSearchModal.addEventListener('click', () => mobileSearchModal.classList.remove('open'));
    }
    if (mobileSearchModal) {
      mobileSearchModal.addEventListener('click', (e) => { if (e.target === mobileSearchModal) mobileSearchModal.classList.remove('open'); });
    }

    function handleSearch(query, isMobile = false) {
      const targetDropdown = isMobile ? mobileSearchDropdown : searchDropdown;
      if (!targetDropdown) return;

      const q = query.trim().toLowerCase();
      if (!q) {
        if (!isMobile) targetDropdown.classList.remove('open');
        targetDropdown.innerHTML = isMobile ? `
        <div style="text-align:center; padding:20px; color:var(--ink-soft); font-size:.85rem;" class="t-ar">اكتب كلمة البحث للوصول الفوري للمرضى والفحوصات والمستشفيات...</div>
        <div style="text-align:center; padding:20px; color:var(--ink-soft); font-size:.85rem;" class="t-en">Type your search query to find patients, scans, and hospitals...</div>
      ` : '';
        return;
      }

      const isAr = document.body.classList.contains('lang-ar');
      const filtered = searchData.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.info.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        targetDropdown.innerHTML = `
        <div style="text-align:center; padding:20px; color:var(--ink-soft); font-size:.88rem;">
          ${isAr ? 'لم يتم العثور على نتائج تطابق "' + query + '"' : 'No results found for "' + query + '"'}
        </div>
      `;
      } else {
        let html = `<div class="search-group-title">${isAr ? 'نتائج البحث المطابقة (' + filtered.length + ')' : 'Search Results (' + filtered.length + ')'}</div>`;
        filtered.forEach(item => {
          const title = isAr ? item.name : item.nameEn;
          const icon = item.type === 'patient' ? '🩺' : item.type === 'booking' ? '📅' : item.type === 'lead' ? '📩' : '🏥';
          const badgeClass = item.risk === 'high' ? 'risk-high' : item.risk === 'medium' ? 'risk-medium' : 'risk-low';
          const badgeText = item.risk ? (item.risk === 'high' ? (isAr ? 'عالي' : 'High') : item.risk === 'medium' ? (isAr ? 'متوسط' : 'Moderate') : (isAr ? 'طبيعي' : 'Normal')) : (item.type === 'booking' ? (isAr ? 'موعد' : 'Booking') : (isAr ? 'رسالة' : 'Lead'));

          html += `
          <div class="search-result-item" data-action="${item.action}" data-name="${title}" data-risk="${item.risk || ''}" data-tab="${item.tab || ''}">
            <div class="search-result-icon">${icon}</div>
            <div class="search-result-info">
              <span class="search-result-name">${title}</span>
              <span class="search-result-sub">${item.info}</span>
            </div>
            <span class="search-badge ${badgeClass}">${badgeText}</span>
          </div>
        `;
        });
        targetDropdown.innerHTML = html;

        // Attach click events on search result items
        targetDropdown.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('click', () => {
            const action = el.getAttribute('data-action');
            if (action === 'scan') {
              const name = el.getAttribute('data-name');
              const isAr = document.body.classList.contains('lang-ar');
              modalPatientName.textContent = isAr ? `تقرير فحص المريض: ${name}` : `Patient Scan Report: ${name}`;
              scanModal.classList.add('open');
            } else if (action === 'tab') {
              const tab = el.getAttribute('data-tab');
              const targetNav = document.querySelector(`.sidebar .nav-item[data-tab="${tab}"]`);
              if (targetNav) targetNav.click();
            }
            if (isMobile) {
              mobileSearchModal.classList.remove('open');
            } else {
              targetDropdown.classList.remove('open');
            }
          });
        });
      }
      if (!isMobile) targetDropdown.classList.add('open');
    }

    [searchInput, searchInputEn].forEach(input => {
      if (input) {
        input.addEventListener('focus', (e) => {
          if (window.innerWidth <= 820) {
            input.blur();
            mobileSearchModal.classList.add('open');
            const activeMobileInput = document.body.classList.contains('lang-ar') ? mobileSearchInput : mobileSearchInputEn;
            if (activeMobileInput) setTimeout(() => activeMobileInput.focus(), 150);
          } else if (e.target.value.trim()) {
            handleSearch(e.target.value, false);
          }
        });
        input.addEventListener('input', (e) => {
          if (window.innerWidth > 820) handleSearch(e.target.value, false);
        });
      }
    });

    [mobileSearchInput, mobileSearchInputEn].forEach(input => {
      if (input) {
        input.addEventListener('input', (e) => handleSearch(e.target.value, true));
      }
    });

    // Ctrl + K shortcut focus
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (window.innerWidth <= 820) {
          mobileSearchModal.classList.add('open');
          const activeMobileInput = document.body.classList.contains('lang-ar') ? mobileSearchInput : mobileSearchInputEn;
          if (activeMobileInput) setTimeout(() => activeMobileInput.focus(), 150);
        } else {
          const activeInput = document.body.classList.contains('lang-ar') ? searchInput : searchInputEn;
          if (activeInput) activeInput.focus();
        }
      }
      if (e.key === 'Escape') {
        searchDropdown.classList.remove('open');
        if (mobileSearchModal) mobileSearchModal.classList.remove('open');
      }
    });

    // Close search dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) searchDropdown.classList.remove('open');
    });

    // ---- Notifications Page Filter Pills & Mark Read Logic ----
    const notifBadge = document.getElementById('notifBadge');
    const sidebarNotifBadge = document.getElementById('sidebarNotifBadge');
    const pageMarkReadBtn = document.getElementById('pageMarkReadBtn');
    const pageNotifTotalCount = document.getElementById('pageNotifTotalCount');

    const notifPageFilterPills = document.querySelectorAll('.notif-filter-pill');
    notifPageFilterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPageFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-page-filter');

        document.querySelectorAll('.page-notif-card').forEach(item => {
          if (filter === 'all' || item.getAttribute('data-page-type') === filter) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    if (pageMarkReadBtn) {
      pageMarkReadBtn.addEventListener('click', () => {
        const isAr = document.body.classList.contains('lang-ar');
        document.querySelectorAll('.page-notif-card.unread').forEach(item => item.classList.remove('unread'));
        if (notifBadge) notifBadge.style.display = 'none';
        if (sidebarNotifBadge) sidebarNotifBadge.textContent = '0';
        showToast(isAr ? 'الإشعارات' : 'Notifications', isAr ? 'تم تحديد جميع الإشعارات كمقروءة وتصفير الشارات.' : 'All notifications marked as read.', 'success');
      });
    }

    // ---- User Profile Dropdown Logic ----
    const profileTriggerBtn = document.getElementById('profileTriggerBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const sidebarUserBtn = document.querySelector('.sidebar-user');

    function toggleProfileDropdown(e) {
      if (e) e.stopPropagation();
      if (profileDropdown) profileDropdown.classList.toggle('open');
    }

    if (profileTriggerBtn) profileTriggerBtn.addEventListener('click', toggleProfileDropdown);
    if (sidebarUserBtn) sidebarUserBtn.addEventListener('click', toggleProfileDropdown);

    if (profileDropdown) {
      profileDropdown.querySelectorAll('.profile-menu-item').forEach(item => {
        item.addEventListener('click', () => {
          profileDropdown.classList.remove('open');
          if (window.innerWidth <= 820) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('open');
          }
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#profileTriggerBtn') && !e.target.closest('#profileDropdown') && !e.target.closest('.sidebar-user')) {
        if (profileDropdown) profileDropdown.classList.remove('open');
      }
    });

    // ================= SIMPLE WEBSITE CONTENT EDITOR ENGINE =================
    const CMS_STORAGE_KEY = 'preventech_cms_data';

    const defaultWhyItems = [
      { num: '01', ar: 'حلول مدعومة بالذكاء الاصطناعي', en: 'Artificial Intelligence' },
      { num: '02', ar: 'تطوير برمجيات طبية متخصصة', en: 'Digital Health Innovation' },
      { num: '03', ar: 'تصميم مرتكز على احتياجات المستخدم', en: 'Clinical Decision Support' },
      { num: '04', ar: 'الاعتماد على البيانات في اتخاذ القرار', en: 'Healthcare Operations Intelligence' },
      { num: '05', ar: 'الالتزام بأفضل الممارسات التنظيمية', en: 'Data-Driven Solutions' },
      { num: '06', ar: 'التركيز على الابتكار المستدام', en: 'Regulatory Readiness' },
      { num: '07', ar: 'تقنيات الرعاية الصحية الآمنة', en: 'Secure Healthcare Technologies' }
    ];

    let cmsData = {
      hero: {
        title_ar: 'نقود التحول الصحي عبر حلول تقنية مبتكرة',
        title_en: 'Leading Healthcare Transformation Through Innovative Technology',
        desc_ar: 'نطوّر تقنيات صحية ذكية تجمع بين الابتكار والذكاء الاصطناعي لتحسين جودة الرعاية الصحية، ودعم اتخاذ القرار السريري، وتمكين منظومة صحية أكثر كفاءة واستدامة.',
        desc_en: 'We develop intelligent healthcare technologies powered by Artificial Intelligence to enhance the quality of care, support clinical decision-making, and enable a more efficient and sustainable healthcare ecosystem.',
        img: 'logo.png'
      },
      about: {
        title_ar: 'نبتكر حلولًا صحية تصنع أثرًا',
        title_en: 'Innovating Healthcare with Purpose',
        p1_ar: 'PrevenTech هي شركة سعودية متخصصة في التقنية الصحية (HealthTech)، نطوّر حلولًا رقمية مبتكرة تعتمد على الذكاء الاصطناعي لمعالجة التحديات الصحية وتحسين كفاءة منظومة الرعاية الصحية.',
        p1_en: 'PrevenTech is a Saudi HealthTech company dedicated to developing innovative digital healthcare solutions powered by Artificial Intelligence.'
      },
      why_items: JSON.parse(JSON.stringify(defaultWhyItems)),
      achievements: {
        title_ar: 'PrevenTech ضمن المعسكر التدريبي الوطني للذكاء الاصطناعي الصحي',
        title_en: 'PrevenTech at the National Healthcare AI Sandbox Boot Camp',
        desc_ar: 'شاركت PrevenTech في المعسكر التدريبي للبيئة التجريبية الوطنية للذكاء الاصطناعي في الصحة، بإشراف الشؤون الصحية بوزارة الحرس الوطني (MNGHA)، وتنظيم هيئة المنشآت الصغيرة والمتوسطة (منشآت)، بالشراكة مع الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)، والمركز الوطني لتنمية التقنية (NTDP)، والهيئة العامة للغذاء والدواء، إلى جانب Siemens Healthineers وHUMAIN وجهات رائدة أخرى، خلال الفترة من 19 أبريل حتى 18 يونيو 2026.',
        desc_en: 'PrevenTech took part in the National Healthcare AI Sandbox Boot Camp, held under the supervision of the Ministry of National Guard Health Affairs (MNGHA) and organized by Monsha\'at in partnership with SDAIA, NTDP, the Saudi Food & Drug Authority, Siemens Healthineers, HUMAIN, and other leading organizations, running from April 19 to June 18, 2026.',
        pills: [
          { icon: '🏛️', title_ar: 'إشراف وتنظيم رسمي', title_en: 'Official Governance', desc_ar: 'MNGHA • منشآت • SDAIA', desc_en: 'MNGHA • Monsha\'at • SDAIA' },
          { icon: '🗓️', title_ar: 'مدة المعسكر', title_en: 'Boot Camp Duration', desc_ar: '19 أبريل - 18 يونيو 2026', desc_en: 'April 19 - June 18, 2026' },
          { icon: '🤝', title_ar: 'شركاء التقنية', title_en: 'Global Tech Partners', desc_ar: 'Siemens Healthineers & HUMAIN', desc_en: 'Siemens Healthineers & HUMAIN' },
          { icon: '🏆', title_ar: 'الاعتماد التقني', title_en: 'AI Certification', desc_ar: 'البيئة التجريبية الوطنية (Sandbox)', desc_en: 'National Health AI Sandbox' }
        ],
        gallery: [
          '',
          '',
          '',
          '',
          ''
        ]
      }
    };

    // Image Upload Dropzone Handling
    const heroImageDropzone = document.getElementById('heroImageDropzone');
    const cmsHeroFileInput = document.getElementById('cms_hero_file_input');
    const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreviewImg = document.getElementById('imagePreviewImg');
    const imagePreviewName = document.getElementById('imagePreviewName');
    const changeImageBtn = document.getElementById('changeImageBtn');

    function updateImagePreviewUI(src, name = 'logo.png') {
      if (src) {
        if (imagePreviewImg) imagePreviewImg.src = src;
        if (imagePreviewName) imagePreviewName.textContent = name || 'صورة مخصصة';
        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'none';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'flex';
      } else {
        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'flex';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
      }
    }

    if (heroImageDropzone && cmsHeroFileInput) {
      heroImageDropzone.addEventListener('click', (e) => {
        if (e.target !== changeImageBtn && (!changeImageBtn || !changeImageBtn.contains(e.target))) {
          cmsHeroFileInput.click();
        }
      });

      if (changeImageBtn) {
        changeImageBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          cmsHeroFileInput.click();
        });
      }

      heroImageDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        heroImageDropzone.style.borderColor = 'var(--success)';
        heroImageDropzone.style.background = 'rgba(52, 211, 153, 0.08)';
      });

      heroImageDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        heroImageDropzone.style.borderColor = 'var(--purple)';
        heroImageDropzone.style.background = 'var(--field-bg)';
      });

      heroImageDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        heroImageDropzone.style.borderColor = 'var(--purple)';
        heroImageDropzone.style.background = 'var(--field-bg)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });

      cmsHeroFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
        }
      });

      function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
          showToast('خطأ في الملف', 'يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WEBP).', 'danger');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64Data = evt.target.result;
          if (!cmsData.hero) cmsData.hero = {};
          cmsData.hero.img = base64Data;
          updateImagePreviewUI(base64Data, file.name);
          saveCmsToStorage(false);
          if (cmsHeroFileInput) cmsHeroFileInput.value = '';
          showToast('تم حفظ اللوجو 🖼️', `تم تثبيت صورة اللوجو "${file.name}" وتحديث الموقع فوراً.`, 'success');
        };
        reader.readAsDataURL(file);
      }
    }

    function renderWhyItemsInputs() {
      const container = document.getElementById('cms_why_items_container');
      if (!container) return;
      container.innerHTML = '';

      cmsData.why_items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'grid-2-col';
        row.style.background = 'var(--field-bg)';
        row.style.padding = '14px';
        row.style.borderRadius = '14px';
        row.style.border = '1px solid var(--line)';

        row.innerHTML = `
        <div>
          <label style="font-size:.8rem; font-weight:700; color:var(--purple-deep);">العنصر ${item.num || (index + 1)} (العنوان العربي)</label>
          <input type="text" data-why-idx="${index}" data-why-lang="ar" value="${item.ar}" style="width:100%; padding:8px 12px; border-radius:10px; border:1px solid var(--line); background:var(--card); color:var(--ink); margin-top:4px;">
        </div>
        <div>
          <label style="font-size:.8rem; font-weight:700; color:var(--purple-deep);">Item ${item.num || (index + 1)} (English Title)</label>
          <input type="text" data-why-idx="${index}" data-why-lang="en" value="${item.en}" style="width:100%; padding:8px 12px; border-radius:10px; border:1px solid var(--line); background:var(--card); color:var(--ink); margin-top:4px;">
        </div>
      `;
        container.appendChild(row);
      });

      container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-why-idx'), 10);
          const lang = e.target.getAttribute('data-why-lang');
          if (cmsData.why_items[idx]) {
            cmsData.why_items[idx][lang] = e.target.value;
          }
        });
      });
    }

    function populateCmsForm() {
      if (cmsData.hero) {
        if (document.getElementById('cms_hero_title_ar')) document.getElementById('cms_hero_title_ar').value = cmsData.hero.title_ar || '';
        if (document.getElementById('cms_hero_title_en')) document.getElementById('cms_hero_title_en').value = cmsData.hero.title_en || '';
        if (document.getElementById('cms_hero_desc_ar')) document.getElementById('cms_hero_desc_ar').value = cmsData.hero.desc_ar || '';
        if (document.getElementById('cms_hero_desc_en')) document.getElementById('cms_hero_desc_en').value = cmsData.hero.desc_en || '';
        updateImagePreviewUI(cmsData.hero.img || 'logo.png', 'logo.png');
      }

      if (cmsData.about) {
        if (document.getElementById('cms_about_title_ar')) document.getElementById('cms_about_title_ar').value = cmsData.about.title_ar || '';
        if (document.getElementById('cms_about_title_en')) document.getElementById('cms_about_title_en').value = cmsData.about.title_en || '';
        if (document.getElementById('cms_about_p1_ar')) document.getElementById('cms_about_p1_ar').value = cmsData.about.p1_ar || '';
        if (document.getElementById('cms_about_p1_en')) document.getElementById('cms_about_p1_en').value = cmsData.about.p1_en || '';
      }

      if (cmsData.solutions) {
        if (document.getElementById('cms_prod_title_ar')) document.getElementById('cms_prod_title_ar').value = cmsData.solutions.title_ar || '';
        if (document.getElementById('cms_prod_title_en')) document.getElementById('cms_prod_title_en').value = cmsData.solutions.title_en || '';
        if (document.getElementById('cms_prod_desc_ar')) document.getElementById('cms_prod_desc_ar').value = cmsData.solutions.desc_ar || '';
        if (document.getElementById('cms_prod_desc_en')) document.getElementById('cms_prod_desc_en').value = cmsData.solutions.desc_en || '';
      }

      if (cmsData.tech) {
        if (document.getElementById('cms_tech_title_ar')) document.getElementById('cms_tech_title_ar').value = cmsData.tech.title_ar || '';
        if (document.getElementById('cms_tech_title_en')) document.getElementById('cms_tech_title_en').value = cmsData.tech.title_en || '';
      }

      if (cmsData.process) {
        if (document.getElementById('cms_process_title_ar')) document.getElementById('cms_process_title_ar').value = cmsData.process.title_ar || '';
        if (document.getElementById('cms_process_title_en')) document.getElementById('cms_process_title_en').value = cmsData.process.title_en || '';
      }

      if (cmsData.contact) {
        if (document.getElementById('cms_contact_email')) document.getElementById('cms_contact_email').value = cmsData.contact.email || '';
        if (document.getElementById('cms_contact_phone')) document.getElementById('cms_contact_phone').value = cmsData.contact.phone || '';
        if (document.getElementById('cms_contact_location')) document.getElementById('cms_contact_location').value = cmsData.contact.location || '';
      }

      if (cmsData.social) {
        if (document.getElementById('cms_social_twitter')) document.getElementById('cms_social_twitter').value = cmsData.social.twitter || '';
        if (document.getElementById('cms_social_instagram')) document.getElementById('cms_social_instagram').value = cmsData.social.instagram || '';
        if (document.getElementById('cms_social_linkedin')) document.getElementById('cms_social_linkedin').value = cmsData.social.linkedin || '';
      }

      if (cmsData.visibility) {
        if (document.getElementById('sec_toggle_hero')) document.getElementById('sec_toggle_hero').checked = cmsData.visibility.hero !== false;
        if (document.getElementById('sec_toggle_about')) document.getElementById('sec_toggle_about').checked = cmsData.visibility.about !== false;
        if (document.getElementById('sec_toggle_solutions')) document.getElementById('sec_toggle_solutions').checked = cmsData.visibility.solutions !== false;
        if (document.getElementById('sec_toggle_why')) document.getElementById('sec_toggle_why').checked = cmsData.visibility.why !== false;
        if (document.getElementById('sec_toggle_tech')) document.getElementById('sec_toggle_tech').checked = cmsData.visibility.tech !== false;
        if (document.getElementById('sec_toggle_process')) document.getElementById('sec_toggle_process').checked = cmsData.visibility.process !== false;
        if (document.getElementById('sec_toggle_booking')) document.getElementById('sec_toggle_booking').checked = cmsData.visibility.booking !== false;
        if (document.getElementById('sec_toggle_contact')) document.getElementById('sec_toggle_contact').checked = cmsData.visibility.contact !== false;
      }

      if (cmsData.achievements) {
        if (document.getElementById('cms_achieve_title_ar')) document.getElementById('cms_achieve_title_ar').value = cmsData.achievements.title_ar || '';
        if (document.getElementById('cms_achieve_title_en')) document.getElementById('cms_achieve_title_en').value = cmsData.achievements.title_en || '';
        if (document.getElementById('cms_achieve_desc_ar')) document.getElementById('cms_achieve_desc_ar').value = cmsData.achievements.desc_ar || '';
        if (document.getElementById('cms_achieve_desc_en')) document.getElementById('cms_achieve_desc_en').value = cmsData.achievements.desc_en || '';

        if (Array.isArray(cmsData.achievements.pills)) {
          cmsData.achievements.pills.forEach((p, i) => {
            const idx = i + 1;
            if (document.getElementById(`cms_achieve_pill${idx}_icon`)) document.getElementById(`cms_achieve_pill${idx}_icon`).value = p.icon || '';
            if (document.getElementById(`cms_achieve_pill${idx}_title_ar`)) document.getElementById(`cms_achieve_pill${idx}_title_ar`).value = p.title_ar || '';
            if (document.getElementById(`cms_achieve_pill${idx}_title_en`)) document.getElementById(`cms_achieve_pill${idx}_title_en`).value = p.title_en || '';
            if (document.getElementById(`cms_achieve_pill${idx}_desc_ar`)) document.getElementById(`cms_achieve_pill${idx}_desc_ar`).value = p.desc_ar || '';
            if (document.getElementById(`cms_achieve_pill${idx}_desc_en`)) document.getElementById(`cms_achieve_pill${idx}_desc_en`).value = p.desc_en || '';
          });
        }

        if (Array.isArray(cmsData.achievements.gallery)) {
          cmsData.achievements.gallery.forEach((src, idx) => {
            updateAchieveGalleryPreview(idx, src);
          });
        }
      }

      renderWhyItemsInputs();
    }

    function updateAchieveGalleryPreview(slotIdx, src) {
      const imgPreview = document.getElementById(`achieveImgPreview${slotIdx}`);
      const placeholder = document.getElementById(`achieveImgPlaceholder${slotIdx}`);
      const overlay = document.getElementById(`achieveImgOverlay${slotIdx}`);
      if (!imgPreview) return;

      if (src && src.length > 5) {
        imgPreview.src = src;
        imgPreview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        if (overlay) overlay.style.display = 'flex';
      } else {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        if (overlay) overlay.style.display = 'none';
      }
    }

    // Attach File Upload Event Listeners for 5 Gallery Slots
    for (let slot = 0; slot < 5; slot++) {
      const fileInp = document.getElementById(`achieveFile${slot}`);
      if (fileInp) {
        fileInp.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
              showToast('خطأ في الملف', 'يرجى اختيار صورة صالحة.', 'danger');
              return;
            }
            const reader = new FileReader();
            reader.onload = (evt) => {
              const base64 = evt.target.result;
              if (!cmsData.achievements) cmsData.achievements = {};
              if (!Array.isArray(cmsData.achievements.gallery)) cmsData.achievements.gallery = ['', '', '', '', ''];
              cmsData.achievements.gallery[slot] = base64;
              updateAchieveGalleryPreview(slot, base64);
              saveCmsToStorage(false);
              fileInp.value = '';
              showToast('تم تثبيت الصورة 🖼️', `تم رفع صورة المعرض (${slot + 1}) وحفظها بنجاح!`, 'success');
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }

    window.removeAchieveGalleryImg = function(slotIdx) {
      if (!cmsData.achievements) cmsData.achievements = {};
      if (!Array.isArray(cmsData.achievements.gallery)) cmsData.achievements.gallery = ['', '', '', '', ''];
      cmsData.achievements.gallery[slotIdx] = '';
      const fileInp = document.getElementById(`achieveFile${slotIdx}`);
      if (fileInp) fileInp.value = '';
      updateAchieveGalleryPreview(slotIdx, '');
      saveCmsToStorage(false);
      showToast('تم حذف الصورة 🗑️', `تم إزالة الصورة (${slotIdx + 1}) وحفظ التعديل.`, 'info');
    };

    function readFormToCmsData() {
      cmsData.hero = {
        title_ar: document.getElementById('cms_hero_title_ar') ? document.getElementById('cms_hero_title_ar').value.trim() : '',
        title_en: document.getElementById('cms_hero_title_en') ? document.getElementById('cms_hero_title_en').value.trim() : '',
        desc_ar: document.getElementById('cms_hero_desc_ar') ? document.getElementById('cms_hero_desc_ar').value.trim() : '',
        desc_en: document.getElementById('cms_hero_desc_en') ? document.getElementById('cms_hero_desc_en').value.trim() : '',
        img: cmsData.hero ? (cmsData.hero.img || 'logo.png') : 'logo.png'
      };

      cmsData.about = {
        title_ar: document.getElementById('cms_about_title_ar') ? document.getElementById('cms_about_title_ar').value.trim() : '',
        title_en: document.getElementById('cms_about_title_en') ? document.getElementById('cms_about_title_en').value.trim() : '',
        p1_ar: document.getElementById('cms_about_p1_ar') ? document.getElementById('cms_about_p1_ar').value.trim() : '',
        p1_en: document.getElementById('cms_about_p1_en') ? document.getElementById('cms_about_p1_en').value.trim() : ''
      };

      cmsData.solutions = {
        title_ar: document.getElementById('cms_prod_title_ar') ? document.getElementById('cms_prod_title_ar').value.trim() : '',
        title_en: document.getElementById('cms_prod_title_en') ? document.getElementById('cms_prod_title_en').value.trim() : '',
        desc_ar: document.getElementById('cms_prod_desc_ar') ? document.getElementById('cms_prod_desc_ar').value.trim() : '',
        desc_en: document.getElementById('cms_prod_desc_en') ? document.getElementById('cms_prod_desc_en').value.trim() : ''
      };

      cmsData.tech = {
        title_ar: document.getElementById('cms_tech_title_ar') ? document.getElementById('cms_tech_title_ar').value.trim() : '',
        title_en: document.getElementById('cms_tech_title_en') ? document.getElementById('cms_tech_title_en').value.trim() : ''
      };

      cmsData.process = {
        title_ar: document.getElementById('cms_process_title_ar') ? document.getElementById('cms_process_title_ar').value.trim() : '',
        title_en: document.getElementById('cms_process_title_en') ? document.getElementById('cms_process_title_en').value.trim() : ''
      };

      cmsData.achievements = {
        title_ar: document.getElementById('cms_achieve_title_ar') ? document.getElementById('cms_achieve_title_ar').value.trim() : '',
        title_en: document.getElementById('cms_achieve_title_en') ? document.getElementById('cms_achieve_title_en').value.trim() : '',
        desc_ar: document.getElementById('cms_achieve_desc_ar') ? document.getElementById('cms_achieve_desc_ar').value.trim() : '',
        desc_en: document.getElementById('cms_achieve_desc_en') ? document.getElementById('cms_achieve_desc_en').value.trim() : '',
        pills: [
          {
            icon: document.getElementById('cms_achieve_pill1_icon') ? document.getElementById('cms_achieve_pill1_icon').value.trim() : '🏛️',
            title_ar: document.getElementById('cms_achieve_pill1_title_ar') ? document.getElementById('cms_achieve_pill1_title_ar').value.trim() : '',
            title_en: document.getElementById('cms_achieve_pill1_title_en') ? document.getElementById('cms_achieve_pill1_title_en').value.trim() : '',
            desc_ar: document.getElementById('cms_achieve_pill1_desc_ar') ? document.getElementById('cms_achieve_pill1_desc_ar').value.trim() : '',
            desc_en: document.getElementById('cms_achieve_pill1_desc_en') ? document.getElementById('cms_achieve_pill1_desc_en').value.trim() : ''
          },
          {
            icon: document.getElementById('cms_achieve_pill2_icon') ? document.getElementById('cms_achieve_pill2_icon').value.trim() : '🗓️',
            title_ar: document.getElementById('cms_achieve_pill2_title_ar') ? document.getElementById('cms_achieve_pill2_title_ar').value.trim() : '',
            title_en: document.getElementById('cms_achieve_pill2_title_en') ? document.getElementById('cms_achieve_pill2_title_en').value.trim() : '',
            desc_ar: document.getElementById('cms_achieve_pill2_desc_ar') ? document.getElementById('cms_achieve_pill2_desc_ar').value.trim() : '',
            desc_en: document.getElementById('cms_achieve_pill2_desc_en') ? document.getElementById('cms_achieve_pill2_desc_en').value.trim() : ''
          },
          {
            icon: document.getElementById('cms_achieve_pill3_icon') ? document.getElementById('cms_achieve_pill3_icon').value.trim() : '🤝',
            title_ar: document.getElementById('cms_achieve_pill3_title_ar') ? document.getElementById('cms_achieve_pill3_title_ar').value.trim() : '',
            title_en: document.getElementById('cms_achieve_pill3_title_en') ? document.getElementById('cms_achieve_pill3_title_en').value.trim() : '',
            desc_ar: document.getElementById('cms_achieve_pill3_desc_ar') ? document.getElementById('cms_achieve_pill3_desc_ar').value.trim() : '',
            desc_en: document.getElementById('cms_achieve_pill3_desc_en') ? document.getElementById('cms_achieve_pill3_desc_en').value.trim() : ''
          },
          {
            icon: document.getElementById('cms_achieve_pill4_icon') ? document.getElementById('cms_achieve_pill4_icon').value.trim() : '🏆',
            title_ar: document.getElementById('cms_achieve_pill4_title_ar') ? document.getElementById('cms_achieve_pill4_title_ar').value.trim() : '',
            title_en: document.getElementById('cms_achieve_pill4_title_en') ? document.getElementById('cms_achieve_pill4_title_en').value.trim() : '',
            desc_ar: document.getElementById('cms_achieve_pill4_desc_ar') ? document.getElementById('cms_achieve_pill4_desc_ar').value.trim() : '',
            desc_en: document.getElementById('cms_achieve_pill4_desc_en') ? document.getElementById('cms_achieve_pill4_desc_en').value.trim() : ''
          }
        ],
        gallery: (cmsData.achievements && Array.isArray(cmsData.achievements.gallery)) ? cmsData.achievements.gallery : ['', '', '', '', '']
      };

      cmsData.contact = {
        email: document.getElementById('cms_contact_email') ? document.getElementById('cms_contact_email').value.trim() : '',
        phone: document.getElementById('cms_contact_phone') ? document.getElementById('cms_contact_phone').value.trim() : '',
        location: document.getElementById('cms_contact_location') ? document.getElementById('cms_contact_location').value.trim() : ''
      };

      cmsData.social = {
        twitter: document.getElementById('cms_social_twitter') ? document.getElementById('cms_social_twitter').value.trim() : '',
        instagram: document.getElementById('cms_social_instagram') ? document.getElementById('cms_social_instagram').value.trim() : '',
        linkedin: document.getElementById('cms_social_linkedin') ? document.getElementById('cms_social_linkedin').value.trim() : ''
      };

      cmsData.visibility = {
        hero: document.getElementById('sec_toggle_hero') ? document.getElementById('sec_toggle_hero').checked : true,
        about: document.getElementById('sec_toggle_about') ? document.getElementById('sec_toggle_about').checked : true,
        solutions: document.getElementById('sec_toggle_solutions') ? document.getElementById('sec_toggle_solutions').checked : true,
        why: document.getElementById('sec_toggle_why') ? document.getElementById('sec_toggle_why').checked : true,
        tech: document.getElementById('sec_toggle_tech') ? document.getElementById('sec_toggle_tech').checked : true,
        process: document.getElementById('sec_toggle_process') ? document.getElementById('sec_toggle_process').checked : true,
        booking: document.getElementById('sec_toggle_booking') ? document.getElementById('sec_toggle_booking').checked : true,
        contact: document.getElementById('sec_toggle_contact') ? document.getElementById('sec_toggle_contact').checked : true
      };
    }

    function saveCmsToStorage(notify = true) {
      readFormToCmsData();
      try {
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cmsData));
      } catch (e) {
        console.error('Storage save error:', e);
      }

      // Save Booking Days Checkboxes
      const selectedDays = [];
      document.querySelectorAll('.cms-day-cb:checked').forEach(cb => {
        selectedDays.push(parseInt(cb.value, 10));
      });
      const avail = getBookingAvailability();
      avail.days = selectedDays;
      localStorage.setItem('preventech_booking_availability', JSON.stringify(avail));
      
      // Dispatch storage event for instant live sync
      window.dispatchEvent(new Event('storage'));

      if (notify) {
        const isAr = document.body.classList.contains('lang-ar');
        showToast(
          isAr ? 'تم تحديث المحتوى والإعدادات 🚀' : 'Website Updated Live 🚀',
          isAr ? 'تم حفظ التعديلات وإعدادات الحجز ونشرها فوراً على الموقع!' : 'Website text, images, and booking availability updated live!',
          'success'
        );
      }
    }

    function loadCmsFromStorage() {
      try {
        const saved = localStorage.getItem(CMS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          cmsData = Object.assign({}, cmsData, parsed);
        }
      } catch (e) { }
      populateCmsForm();
    }

    const saveCmsBtn = document.getElementById('saveCmsBtn');
    if (saveCmsBtn) {
      saveCmsBtn.addEventListener('click', () => saveCmsToStorage(true));
    }

    const resetCmsBtn = document.getElementById('resetCmsBtn');
    if (resetCmsBtn) {
      resetCmsBtn.addEventListener('click', () => {
        const isAr = document.body.classList.contains('lang-ar');
        showConfirm(
          isAr ? 'استعادة النصوص الأصلية' : 'Reset Content',
          isAr ? 'هل أنت تأكد من استعادة النصوص الافتراضية للموقع؟' : 'Are you sure you want to reset all content to default?',
          () => {
            localStorage.removeItem(CMS_STORAGE_KEY);
            cmsData.why_items = JSON.parse(JSON.stringify(defaultWhyItems));
            loadCmsFromStorage();
            window.dispatchEvent(new Event('storage'));
            showToast(isAr ? 'تمت استعادة المحتوى' : 'Reset Complete', isAr ? 'تمت استعادة نصوص الموقع الأصلية بنجاح.' : 'Content reset to default.', 'info');
          }
        );
      });
    }

    // ================= LIVE WEBSITE BOOKINGS & LEADS DEFAULTS =================
    const defaultBookings = [
      {
        id: 'BK-9841',
        name: 'د. فهد العتيبي',
        org: 'مستشفى السلام الدولي',
        email: 'fahad@alsalam-hospital.sa',
        phone: '+966 50 888 1122',
        solution: 'Mo\'eenTech AI',
        date: '26 يوليو 2026',
        time: '10:00 صباحاً',
        notes: 'طلب دمج واستشارة لتجربة فحص القدم السكرية في عيادات المستشفى.',
        status: 'مؤكدة'
      },
      {
        id: 'BK-9840',
        name: 'أ. مريم الدوسري',
        org: 'مدينة الملك عبدالملك الطبية',
        email: 'm.dosari@kkmc.med.sa',
        phone: '+966 55 443 9911',
        solution: 'Healora',
        date: '27 يوليو 2026',
        time: '11:30 صباحاً',
        notes: 'استشارة حول منصة التشخيص المبكر والربط السحابي.',
        status: 'مؤكدة'
      }
    ];

    const defaultLeads = [
      {
        id: 'LD-1042',
        name: 'د. فهد العتيبي',
        title: 'مدير الشؤون الطبية',
        org: 'مستشفى السلام الدولي',
        email: 'fahad@alsalam-hospital.sa',
        phone: '+966 50 888 1122',
        inquiry: 'طلب استشارة في تقنيات الرعاية الصحية',
        solution: 'Mo\'eenTech AI',
        message: 'طلب استشارة واجتماع دمج لأنظمة الذكاء الاصطناعي مع المستشفى.',
        date: 'اليوم 11:20 AM'
      },
      {
        id: 'LD-1041',
        name: 'أ. مريم الدوسري',
        title: 'رئيسة التحول الرقمي',
        org: 'مدينة الملك عبدالملك الطبية',
        email: 'm.dosari@kkmc.med.sa',
        phone: '+966 55 443 9911',
        inquiry: 'استفسار عن حلول الذكاء الاصطناعي',
        solution: 'Healora',
        message: 'استفسار حول حلول التشخيص المبكر وتراخيص SaMD.',
        date: 'أمس 04:15 PM'
      }
    ];

    // ================= RECORD DETAILS MODAL & DELETE ENGINE =================
    function hideRecordModal() {
      const modal = document.getElementById('recordDetailsModal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    const closeRecordDetailsModal = document.getElementById('closeRecordDetailsModal');
    const closeFromModalBtn = document.getElementById('closeFromModalBtn');

    if (closeRecordDetailsModal) closeRecordDetailsModal.addEventListener('click', hideRecordModal);
    if (closeFromModalBtn) closeFromModalBtn.addEventListener('click', hideRecordModal);
    
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('recordDetailsModal');
      if (e.target === modal) hideRecordModal();
    });

    // View & Delete Handlers for Bookings
    window.viewBookingDetails = function (id) {
      let bookings = [];
      try {
        const raw = localStorage.getItem('preventech_bookings');
        if (raw) bookings = JSON.parse(raw);
      } catch (e) { }
      if (!bookings || bookings.length === 0) bookings = defaultBookings;

      const b = bookings.find(item => item.id === id) || bookings[0];
      if (!b) return;

      const titleEl = document.getElementById('recordModalTitle');
      const subEl = document.getElementById('recordModalSubtitle');
      const bodyEl = document.getElementById('recordModalBody');
      const delBtn = document.getElementById('deleteFromModalBtn');

      if (titleEl) titleEl.innerHTML = `<span class="t-ar">معاينة حجز الموعد 📅</span><span class="t-en">Booking Details 📅</span>`;
      if (subEl) subEl.textContent = `${b.name} • ${b.id}`;

      if (bodyEl) {
        bodyEl.innerHTML = `
        <div style="background:var(--field-bg); padding:18px; border-radius:16px; border:1px solid var(--line); display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <b style="font-size:1.1rem; color:var(--ink);">${b.name}</b>
            <span class="status-tag status-confirmed">● ${b.status || 'مؤكدة'}</span>
          </div>
          <div style="font-size:.88rem; color:var(--ink-soft);">🏥 <b>الجهة الصحية / المنشأة:</b> ${b.org || 'منشأة صحية'}</div>
          <div style="font-size:.88rem; color:var(--ink-soft);">📧 <b>البريد الإلكتروني:</b> ${b.email || 'غير محدد'}</div>
          <div style="font-size:.88rem; color:var(--ink-soft);">📞 <b>رقم الجوال والتواصل:</b> ${b.phone || 'غير محدد'}</div>
          <div style="font-size:.88rem; color:var(--purple-deep); font-weight:700;">⚙️ <b>الحل المطلوب:</b> ${b.solution || 'استشارة تقنية'}</div>
          <div style="font-size:.88rem; color:var(--ink-soft);">📅 <b>التاريخ والوقت المحدد:</b> ${b.date} • ${b.time}</div>
          ${b.notes ? `<div style="font-size:.86rem; color:var(--ink); background:var(--card); padding:12px 14px; border-radius:12px; border:1px solid var(--line); margin-top:4px;"><b>📝 الملاحظات والتفاصيل:</b><br>${b.notes}</div>` : ''}
        </div>
      `;
      }

      if (delBtn) delBtn.onclick = () => window.deleteBookingItem(b.id);
      const modal = document.getElementById('recordDetailsModal');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
      }
    };

    window.deleteBookingItem = function (id) {
      const isAr = document.body.classList.contains('lang-ar');
      showConfirm(
        isAr ? 'تأكيد الحذف' : 'Confirm Deletion',
        isAr ? 'هل أنت تأكد من حذف هذا الحجز نهائياً من لوحة التحكم؟' : 'Are you sure you want to delete this booking?',
        () => {
          let bookings = [];
          try {
            const raw = localStorage.getItem('preventech_bookings');
            if (raw) bookings = JSON.parse(raw);
          } catch (e) { }
          if (!bookings || bookings.length === 0) bookings = [...defaultBookings];

          const filtered = bookings.filter(b => b.id !== id);
          localStorage.setItem('preventech_bookings', JSON.stringify(filtered));
          window.dispatchEvent(new Event('storage'));
          renderLiveDashboardBookings();
          renderLiveDashboardNotifications();

          hideRecordModal();
          showToast(isAr ? 'تم الحذف بنجاح 🗑️' : 'Deleted Successfully 🗑️', isAr ? 'تم حذف الحجز وإزالته من القائمة.' : 'Booking record deleted.', 'success');
        }
      );
    };

    // View & Delete Handlers for Leads / Inquiries
    window.viewLeadDetails = function (id) {
      let leads = [];
      try {
        const raw = localStorage.getItem('preventech_leads');
        if (raw) leads = JSON.parse(raw);
      } catch (e) { }
      if (!leads || leads.length === 0) leads = defaultLeads;

      const l = leads.find(item => item.id === id) || leads[0];
      if (!l) return;

      const titleEl = document.getElementById('recordModalTitle');
      const subEl = document.getElementById('recordModalSubtitle');
      const bodyEl = document.getElementById('recordModalBody');
      const delBtn = document.getElementById('deleteFromModalBtn');

      if (titleEl) titleEl.innerHTML = `<span class="t-ar">معاينة استفسار العميل 📩</span><span class="t-en">Inquiry Details 📩</span>`;
      if (subEl) subEl.textContent = `${l.name} • ${l.id || 'Lead'}`;

      if (bodyEl) {
        bodyEl.innerHTML = `
        <div style="background:var(--field-bg); padding:18px; border-radius:16px; border:1px solid var(--line); display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <b style="font-size:1.1rem; color:var(--ink);">${l.name}</b>
            <span class="status-tag status-pending">${l.title || 'رسالة تواصل'}</span>
          </div>
          <div style="font-size:.88rem; color:var(--ink-soft);">🏥 <b>الجهة الصحية:</b> ${l.org || 'جهة صحية'}</div>
          <div style="font-size:.88rem; color:var(--ink-soft);">📧 <b>البريد الإلكتروني:</b> ${l.email || 'غير محدد'}</div>
          <div style="font-size:.88rem; color:var(--ink-soft);">📞 <b>رقم التواصل:</b> ${l.phone || 'غير محدد'}</div>
          <div style="font-size:.88rem; color:var(--purple-deep); font-weight:700;">📌 <b>نوع الاستفسار:</b> ${l.inquiry || 'تواصل عام'}</div>
          <div style="font-size:.88rem; color:var(--ink-soft);">🕒 <b>الوقت والتاريخ:</b> ${l.date || 'اليوم'} ${l.timestamp ? '• ' + l.timestamp : ''}</div>
          <div style="font-size:.86rem; color:var(--ink); background:var(--card); padding:12px 14px; border-radius:12px; border:1px solid var(--line); margin-top:4px;">
            <b>💬 نص الرسالة والملاحظات:</b><br>"${l.message || l.inquiry || 'طلب تواصل واستشارة عبر الموقع'}"
          </div>
        </div>
      `;
      }

      if (delBtn) delBtn.onclick = () => window.deleteLeadItem(l.id);
      const modal = document.getElementById('recordDetailsModal');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
      }
    };

    window.deleteLeadItem = function (id) {
      const isAr = document.body.classList.contains('lang-ar');
      showConfirm(
        isAr ? 'تأكيد الحذف' : 'Confirm Deletion',
        isAr ? 'هل أنت تأكد من حذف هذه الرسالة نهائياً من لوحة التحكم؟' : 'Are you sure you want to delete this inquiry?',
        () => {
          let leads = [];
          try {
            const raw = localStorage.getItem('preventech_leads');
            if (raw) leads = JSON.parse(raw);
          } catch (e) { }
          if (!leads || leads.length === 0) leads = [...defaultLeads];

          const filtered = leads.filter(l => l.id !== id);
          localStorage.setItem('preventech_leads', JSON.stringify(filtered));
          window.dispatchEvent(new Event('storage'));
          renderLiveDashboardLeads();
          renderLiveDashboardNotifications();

          hideRecordModal();
          showToast(isAr ? 'تم الحذف بنجاح 🗑️' : 'Deleted Successfully 🗑️', isAr ? 'تم حذف الرسالة وإزالتها.' : 'Inquiry record deleted.', 'success');
        }
      );
    };

    // ================= LIVE WEBSITE BOOKINGS SYNC ENGINE =================
    function renderLiveDashboardBookings() {
      let bookings = [];
      try {
        const raw = localStorage.getItem('preventech_bookings');
        if (raw) {
          bookings = JSON.parse(raw);
        }
      } catch (e) { }

      if (!bookings || bookings.length === 0) {
        bookings = defaultBookings;
      }

      // Update Stat Counters
      const countVal = bookings.length;
      const dashCount = document.getElementById('dashBookingsCount');
      const consultCount = document.getElementById('consultationsTotalCount');
      const confirmedCount = document.getElementById('consultationsConfirmedCount');

      if (dashCount) dashCount.textContent = countVal;
      if (consultCount) consultCount.textContent = countVal;
      if (confirmedCount) confirmedCount.textContent = countVal;

      // Render Overview Table (Latest 5 Bookings)
      const overviewBody = document.getElementById('overviewBookingsTableBody');
      if (overviewBody) {
        overviewBody.innerHTML = bookings.slice(0, 5).map(b => `
        <tr>
          <td><b>${b.name}</b><br><span style="font-size:.76rem;color:var(--ink-soft);">${b.org || 'منشأة صحية'} • ${b.id}</span></td>
          <td>${b.email || '-'}<br><span style="font-size:.76rem;color:var(--ink-soft);">${b.phone || '-'}</span></td>
          <td><span style="color:var(--purple-deep); font-weight:700;">${b.solution || 'استشارة'}</span></td>
          <td>${b.date} • ${b.time}</td>
          <td><span class="status-tag status-confirmed"><span class="t-ar">● ${b.status || 'مؤكدة'}</span><span class="t-en">● ${b.status || 'Confirmed'}</span></span></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-action" onclick="viewBookingDetails('${b.id}')" style="background:var(--grad-soft); color:var(--purple-deep); border-color:var(--purple); padding:6px 12px;"><span class="t-ar">معاينة 👁️</span><span class="t-en">View 👁️</span></button>
              <button class="btn-action" onclick="deleteBookingItem('${b.id}')" style="background:rgba(255,82,82,0.12); color:var(--danger); border-color:rgba(255,82,82,0.3); padding:6px 12px;"><span class="t-ar">حذف 🗑️</span><span class="t-en">Delete 🗑️</span></button>
            </div>
          </td>
        </tr>
      `).join('');
      }

      // Render Consultations Hub Table (All Bookings)
      const consultBody = document.getElementById('consultationsBookingsTableBody');
      if (consultBody) {
        consultBody.innerHTML = bookings.map(b => `
        <tr>
          <td>
            <b>${b.name}</b><br>
            <span style="font-size:.76rem;color:var(--ink-soft);">${b.org || 'منشأة صحية'} • ${b.id}</span>
          </td>
          <td>${b.solution || 'دمج واستشارة تقنية'}</td>
          <td>${b.date} • ${b.time}</td>
          <td>${b.phone}<br><span style="font-size:.76rem;color:var(--ink-soft);">${b.email}</span></td>
          <td><span class="status-tag status-confirmed"><span class="t-ar">● ${b.status || 'مؤكدة'}</span><span class="t-en">● ${b.status || 'Confirmed'}</span></span></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-action" onclick="viewBookingDetails('${b.id}')" style="background:var(--grad-soft); color:var(--purple-deep); border-color:var(--purple); padding:6px 12px;"><span class="t-ar">معاينة 👁️</span><span class="t-en">View 👁️</span></button>
              <button class="btn-action" onclick="deleteBookingItem('${b.id}')" style="background:rgba(255,82,82,0.12); color:var(--danger); border-color:rgba(255,82,82,0.3); padding:6px 12px;"><span class="t-ar">حذف 🗑️</span><span class="t-en">Delete 🗑️</span></button>
            </div>
          </td>
        </tr>
      `).join('');
      }
    }

    renderLiveDashboardBookings();
    window.addEventListener('storage', renderLiveDashboardBookings);

    // ================= LIVE WEBSITE CONTACT LEADS & INQUIRIES SYNC ENGINE =================
    function renderLiveDashboardLeads() {
      let leads = [];
      try {
        const raw = localStorage.getItem('preventech_leads');
        if (raw) {
          leads = JSON.parse(raw);
        }
      } catch (e) { }

      if (!leads || leads.length === 0) {
        leads = defaultLeads;
      }

      // Update Stat Counters
      const countVal = leads.length;
      const totalCountEl = document.getElementById('leadsTotalCount');
      const unreadCountEl = document.getElementById('leadsUnreadCount');
      const dashLeadsCountEl = document.getElementById('dashLeadsCount');

      if (totalCountEl) totalCountEl.textContent = countVal;
      if (unreadCountEl) unreadCountEl.textContent = Math.ceil(countVal / 2);
      if (dashLeadsCountEl) dashLeadsCountEl.textContent = countVal;

      // Render Overview Inquiries Table (Latest 5 Leads)
      const overviewLeadsBody = document.getElementById('overviewLeadsTableBody');
      if (overviewLeadsBody) {
        overviewLeadsBody.innerHTML = leads.slice(0, 5).map(l => `
        <tr>
          <td><b>${l.name}</b><br><span style="font-size:.76rem;color:var(--ink-soft);">${l.org || 'منشأة صحية'} • ${l.title || 'ممثل'}</span></td>
          <td>${l.email || '-'}<br><span style="font-size:.76rem;color:var(--ink-soft);">${l.phone || '-'}</span></td>
          <td><b style="color:var(--purple-deep);">${l.inquiry || 'استفسار عام'}</b><br><span style="font-size:.76rem;color:var(--ink-soft);">${l.solution || 'Mo\'eenTech'}</span></td>
          <td>${l.date || 'اليوم'} ${l.timestamp ? '• ' + l.timestamp : ''}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-action" onclick="viewLeadDetails('${l.id}')" style="background:var(--grad-soft); color:var(--purple-deep); border-color:var(--purple); padding:6px 12px;"><span class="t-ar">معاينة 👁️</span><span class="t-en">View 👁️</span></button>
              <button class="btn-action" onclick="deleteLeadItem('${l.id}')" style="background:rgba(255,82,82,0.12); color:var(--danger); border-color:rgba(255,82,82,0.3); padding:6px 12px;"><span class="t-ar">حذف 🗑️</span><span class="t-en">Delete 🗑️</span></button>
            </div>
          </td>
        </tr>
      `).join('');
      }

      // Render Dedicated Leads Hub Table (All Leads)
      const leadsBody = document.getElementById('leadsTableBody');
      if (leadsBody) {
        leadsBody.innerHTML = leads.map(l => `
        <tr>
          <td>
            <b>${l.name}</b><br>
            <span style="font-size:.76rem;color:var(--ink-soft);">${l.title || 'ممثل جهة'} • ${l.id}</span>
          </td>
          <td>${l.org || 'جهة صحية'}<br><span style="font-size:.76rem;color:var(--purple-deep); font-weight:700;">${l.inquiry || 'استفسار'}</span></td>
          <td>${l.email}<br><span style="font-size:.76rem;color:var(--ink-soft);">${l.phone}</span></td>
          <td style="max-width:260px; white-space:normal; font-size:.82rem;">"${l.message || 'طلب تواصل واستشارة عبر الموقع'}"</td>
          <td>${l.date || 'اليوم'} ${l.timestamp ? '<br><span style="font-size:.74rem;color:var(--ink-soft);">' + l.timestamp + '</span>' : ''}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-action" onclick="viewLeadDetails('${l.id}')" style="background:var(--grad-soft); color:var(--purple-deep); border-color:var(--purple); padding:6px 12px;"><span class="t-ar">معاينة 👁️</span><span class="t-en">View 👁️</span></button>
              <button class="btn-action" onclick="deleteLeadItem('${l.id}')" style="background:rgba(255,82,82,0.12); color:var(--danger); border-color:rgba(255,82,82,0.3); padding:6px 12px;"><span class="t-ar">حذف 🗑️</span><span class="t-en">Delete 🗑️</span></button>
            </div>
          </td>
        </tr>
      `).join('');
      }
    }

    renderLiveDashboardLeads();
    window.addEventListener('storage', renderLiveDashboardLeads);

    // ================= DYNAMIC NOTIFICATIONS SYNC ENGINE =================
    let notifFilterState = 'all';

    function renderLiveDashboardNotifications() {
      let bookings = [];
      let leads = [];
      try {
        const rawB = localStorage.getItem('preventech_bookings');
        if (rawB) bookings = JSON.parse(rawB);
      } catch (e) { }
      try {
        const rawL = localStorage.getItem('preventech_leads');
        if (rawL) leads = JSON.parse(rawL);
      } catch (e) { }

      if (!bookings || bookings.length === 0) bookings = defaultBookings;
      if (!leads || leads.length === 0) leads = defaultLeads;

      const isRead = localStorage.getItem('preventech_notifs_read') === 'true';

      let notifItems = [];

      bookings.forEach(b => {
        notifItems.push({
          id: b.id,
          type: 'consultations',
          icon: '📅',
          titleAr: `حجز موعد استشارة جديد: ${b.name}`,
          titleEn: `New Consultation Booked: ${b.name}`,
          descAr: `الجهة: <b>${b.org || 'منشأة صحية'}</b> • الموعد: <b>${b.date} (${b.time})</b> • الخدمة: ${b.solution || 'استشارة'}`,
          descEn: `Facility: <b>${b.org || 'Healthcare Facility'}</b> • Date: <b>${b.date} (${b.time})</b>`,
          timeAr: `اليوم • ${b.timestamp || b.time || '10:00 AM'}`,
          timeEn: `Today • ${b.timestamp || b.time || '10:00 AM'}`,
          targetTab: 'consultations',
          actionAr: 'عرض جدول المواعيد ←',
          actionEn: 'View Schedule ←',
          unread: !isRead
        });
      });

      leads.forEach(l => {
        notifItems.push({
          id: l.id,
          type: 'leads',
          icon: '📩',
          titleAr: `رسالة تواصل جديدة: ${l.name}`,
          titleEn: `New Website Inquiry: ${l.name}`,
          descAr: `الجهة: <b>${l.org || 'منشأة صحية'}</b> • الموضوع: <b>${l.inquiry || 'استفسار عام'}</b> • الرسالة: "${l.message || l.inquiry}"`,
          descEn: `Facility: <b>${l.org || 'Facility'}</b> • Inquiry: <b>${l.inquiry || 'General'}</b>`,
          timeAr: `${l.date || 'اليوم'} • ${l.timestamp || '11:20 AM'}`,
          timeEn: `${l.date || 'Today'} • ${l.timestamp || '11:20 AM'}`,
          targetTab: 'leads',
          actionAr: 'عرض الرسائل والرد ←',
          actionEn: 'View & Reply ←',
          unread: !isRead
        });
      });

      // Update counters
      const totalCount = notifItems.length;
      const consultCount = bookings.length;
      const leadsCount = leads.length;
      const unreadCount = isRead ? 0 : totalCount;

      const pageNotifTotalCount = document.getElementById('pageNotifTotalCount');
      const pageNotifConsultCount = document.getElementById('pageNotifConsultCount');
      const pageNotifLeadsCount = document.getElementById('pageNotifLeadsCount');
      const pageNotifUnreadCount = document.getElementById('pageNotifUnreadCount');
      const notifBadge = document.getElementById('notifBadge');

      if (pageNotifTotalCount) pageNotifTotalCount.textContent = totalCount;
      if (pageNotifConsultCount) pageNotifConsultCount.textContent = consultCount;
      if (pageNotifLeadsCount) pageNotifLeadsCount.textContent = leadsCount;
      if (pageNotifUnreadCount) pageNotifUnreadCount.textContent = unreadCount;

      if (notifBadge) {
        if (unreadCount > 0) {
          notifBadge.style.display = 'block';
          notifBadge.textContent = unreadCount;
        } else {
          notifBadge.style.display = 'none';
        }
      }

      // Filter items
      const filteredItems = notifItems.filter(item => {
        if (notifFilterState === 'all') return true;
        return item.type === notifFilterState;
      });

      const listContainer = document.getElementById('dynamicNotifList');
      if (listContainer) {
        if (filteredItems.length === 0) {
          listContainer.innerHTML = `<div style="text-align:center; padding:40px; color:var(--ink-soft);"><span class="t-ar">لا توجد إشعارات حالياً</span><span class="t-en">No notifications currently</span></div>`;
        } else {
          listContainer.innerHTML = filteredItems.map(n => `
            <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="${n.type === 'consultations' ? `viewBookingDetails('${n.id}')` : `viewLeadDetails('${n.id}')`}">
              <div class="notif-icon">${n.icon}</div>
              <div class="notif-content">
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                  <div class="notif-title"><span class="t-ar">${n.titleAr}</span><span class="t-en">${n.titleEn}</span></div>
                  <span class="status-tag status-confirmed"><span class="t-ar">جديد</span><span class="t-en">New</span></span>
                </div>
                <div class="notif-desc">
                  <span class="t-ar">${n.descAr}</span>
                  <span class="t-en">${n.descEn}</span>
                </div>
                <div class="notif-footer">
                  <span class="notif-time"><span class="t-ar">${n.timeAr}</span><span class="t-en">${n.timeEn}</span></span>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <button class="btn-action" onclick="event.stopPropagation(); ${n.type === 'consultations' ? `viewBookingDetails('${n.id}')` : `viewLeadDetails('${n.id}')`}" style="background:var(--grad-soft); color:var(--purple-deep); border-color:var(--purple); padding:5px 12px; font-size:.78rem;"><span class="t-ar">معاينة 👁️</span><span class="t-en">View 👁️</span></button>
                    <button class="btn-action" onclick="event.stopPropagation(); ${n.type === 'consultations' ? `deleteBookingItem('${n.id}')` : `deleteLeadItem('${n.id}')`}" style="background:rgba(255,82,82,0.12); color:var(--danger); border-color:rgba(255,82,82,0.3); padding:5px 12px; font-size:.78rem;"><span class="t-ar">حذف 🗑️</span><span class="t-en">Delete 🗑️</span></button>
                  </div>
                </div>
              </div>
            </div>
          `).join('');

          // Re-bind click handlers for dynamic nav-triggers inside list
          listContainer.querySelectorAll('.nav-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
              const tab = trigger.getAttribute('data-tab');
              if (tab) switchTab(tab);
            });
          });
        }
      }
    }

    // Filter Listeners
    document.querySelectorAll('[data-notif-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-notif-filter]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        notifFilterState = pill.getAttribute('data-notif-filter');
        renderLiveDashboardNotifications();
      });
    });

    // Mark all as read button
    const btnMarkAllRead = document.getElementById('pageMarkReadBtn');
    if (btnMarkAllRead) {
      btnMarkAllRead.addEventListener('click', () => {
        localStorage.setItem('preventech_notifs_read', 'true');
        renderLiveDashboardNotifications();
        showToast('تم التحديد كمقروء', 'تم تحديد جميع التنبيهات كمقروءة وإلغاء شارة التنبيه.', 'success');
      });
    }

    renderLiveDashboardNotifications();
    window.addEventListener('storage', renderLiveDashboardNotifications);

    // ================= BOOKING AVAILABILITY MANAGER =================
    const defaultAvailability = {
      days: [0, 1, 2, 3, 4], // Sun, Mon, Tue, Wed, Thu
      slots: [
        { ar: "09:00 صباحًا", en: "09:00 AM", active: true },
        { ar: "10:00 صباحًا", en: "10:00 AM", active: true },
        { ar: "11:30 صباحًا", en: "11:30 AM", active: true },
        { ar: "01:00 ظهرًا", en: "01:00 PM", active: true },
        { ar: "02:30 ظهرًا", en: "02:30 PM", active: true },
        { ar: "04:00 عصرًا", en: "04:00 PM", active: true }
      ]
    };

    function getBookingAvailability() {
      try {
        const raw = localStorage.getItem('preventech_booking_availability');
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      return defaultAvailability;
    }

    function renderAvailabilityCMS() {
      const avail = getBookingAvailability();

      // Days Checkboxes
      document.querySelectorAll('.cms-day-cb').forEach(cb => {
        const val = parseInt(cb.value, 10);
        cb.checked = avail.days.includes(val);
      });

      // Time Slots Grid
      const container = document.getElementById('cmsTimeSlotsGrid');
      if (container) {
        container.innerHTML = avail.slots.map((s, idx) => `
          <div style="display:flex; align-items:center; justify-content:space-between; background:var(--field-bg); padding:8px 12px; border-radius:10px; border:1px solid var(--line);">
            <div style="font-size:.84rem; font-weight:700; color:var(--ink);">
              <span class="t-ar">${s.ar}</span> / <span class="t-en">${s.en}</span>
            </div>
            <button type="button" onclick="deleteTimeSlot(${idx})" style="color:var(--danger); font-size:.8rem; cursor:pointer;" title="حذف الفترة">✖</button>
          </div>
        `).join('');
      }
    }

    window.deleteTimeSlot = function (idx) {
      const avail = getBookingAvailability();
      avail.slots.splice(idx, 1);
      localStorage.setItem('preventech_booking_availability', JSON.stringify(avail));
      window.dispatchEvent(new Event('storage'));
      renderAvailabilityCMS();
      showToast('حذف فترة زمنية', 'تم حذف الفترة الزمنية بنجاح.', 'info');
    };

    const addTimeSlotBtn = document.getElementById('addTimeSlotBtn');
    if (addTimeSlotBtn) {
      addTimeSlotBtn.addEventListener('click', () => {
        const ar = document.getElementById('addSlotAr').value.trim();
        const en = document.getElementById('addSlotEn').value.trim();
        if (!ar || !en) {
          showToast('تنبيه', 'يرجى إدخال اسم الفترة بالعربي والإنجليزي.', 'warning');
          return;
        }
        const avail = getBookingAvailability();
        avail.slots.push({ ar: ar, en: en, active: true });
        localStorage.setItem('preventech_booking_availability', JSON.stringify(avail));
        window.dispatchEvent(new Event('storage'));
        document.getElementById('addSlotAr').value = '';
        document.getElementById('addSlotEn').value = '';
        renderAvailabilityCMS();
        showToast('إضافة فترة', `تمت إضافة الفترة ${ar} بنجاح!`, 'success');
      });
    }

    renderAvailabilityCMS();
    loadCmsFromStorage();