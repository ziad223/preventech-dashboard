(() => {
  "use strict";

  // ضع رابط الـWorker بعد Deploy.
  const API_BASE = "https://preventech-api.negm.workers.dev";
  const ADMIN_KEY_STORAGE = "preventech_admin_api_key_v1";

  let suppressLocalChange = false;
  let syncing = false;

  let snapshots = {
    bookings: [],
    leads: [],
    cms: null,
    availability: null
  };

  function apiReady() {
    return !API_BASE.includes("YOUR-WORKER");
  }

  function getAdminKey() {
    let key = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (key) return key;

    key = window.prompt(
      "أدخل Admin API Key الخاص بـ PrevenTech.\nسيتم حفظه لهذه الجلسة فقط."
    );

    if (!key) return null;
    key = key.trim();
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
    return key;
  }

  async function request(path, options = {}, admin = false) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (admin) {
      const key = getAdminKey();
      if (!key) throw new Error("Admin API Key is required");
      headers.Authorization = `Bearer ${key}`;
    }

    const response = await fetch(API_BASE + path, {
      ...options,
      headers
    });

    let payload = null;
    try { payload = await response.json(); } catch {}

    if (!response.ok || payload?.ok === false) {
      if (response.status === 401) {
        localStorage.removeItem(ADMIN_KEY_STORAGE);
      }
      throw new Error(payload?.error || `HTTP ${response.status}`);
    }
    return payload;
  }

  function parseStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function ids(items) {
    return new Set((Array.isArray(items) ? items : []).map(v => v?.id).filter(Boolean));
  }

  function sameJson(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function renderEmptyStateIfNeeded(bookings, leads) {
    if (Array.isArray(bookings) && bookings.length === 0) {
      const idsToClear = [
        "overviewBookingsTableBody",
        "consultationsBookingsTableBody"
      ];

      idsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:28px;color:var(--ink-soft);">
              لا توجد حجوزات حقيقية حتى الآن
            </td></tr>`;
        }
      });

      ["dashBookingsCount", "consultationsTotalCount", "consultationsConfirmedCount"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = "0";
        });
    }

    if (Array.isArray(leads) && leads.length === 0) {
      ["leadsTableBody"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:28px;color:var(--ink-soft);">
              لا توجد رسائل أو استفسارات حقيقية حتى الآن
            </td></tr>`;
        }
      });
    }
  }

  async function pullRemote() {
    if (!apiReady() || syncing) return;
    syncing = true;

    try {
      const [bookingsRes, leadsRes, cmsRes, availabilityRes] = await Promise.all([
        request("/api/admin/bookings?limit=500", {}, true),
        request("/api/admin/leads?limit=500", {}, true),
        request("/api/public/cms"),
        request("/api/public/availability")
      ]);

      const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
      const cms = cmsRes.data ?? null;
      const availability = availabilityRes.data ?? null;

      snapshots = {
        bookings: structuredClone(bookings),
        leads: structuredClone(leads),
        cms: structuredClone(cms),
        availability: structuredClone(availability)
      };

      suppressLocalChange = true;
      try {
        localStorage.setItem("preventech_bookings", JSON.stringify(bookings));
        localStorage.setItem("preventech_leads", JSON.stringify(leads));

        if (cms === null) {
          localStorage.removeItem("preventech_cms_data");
        } else {
          localStorage.setItem("preventech_cms_data", JSON.stringify(cms));
        }

        if (availability) {
          localStorage.setItem(
            "preventech_booking_availability",
            JSON.stringify(availability)
          );
        }

        // الداشبورد الحالية تستخدم Event storage لإعادة الرسم.
        window.dispatchEvent(new Event("storage"));
      } finally {
        suppressLocalChange = false;
      }

      // الكود القديم يعرض Demo records عندما تكون المصفوفة فارغة.
      // هذه الخطوة تمنع عرضها كأنها بيانات حقيقية.
      setTimeout(() => renderEmptyStateIfNeeded(bookings, leads), 0);
    } catch (error) {
      console.error("[PrevenTech Dashboard Sync] pull:", error);
    } finally {
      syncing = false;
    }
  }

  async function pushLocalChanges() {
    if (!apiReady() || suppressLocalChange || syncing) return;
    syncing = true;

    try {
      const localBookings = parseStorage("preventech_bookings", []);
      const localLeads = parseStorage("preventech_leads", []);
      const localCms = parseStorage("preventech_cms_data", null);
      const localAvailability = parseStorage("preventech_booking_availability", null);

      // DELETE bookings
      const localBookingIds = ids(localBookings);
      for (const old of snapshots.bookings) {
        if (old?.id && !localBookingIds.has(old.id)) {
          await request(
            `/api/admin/bookings/${encodeURIComponent(old.id)}`,
            { method: "DELETE" },
            true
          );
        }
      }

      // DELETE leads
      const localLeadIds = ids(localLeads);
      for (const old of snapshots.leads) {
        if (old?.id && !localLeadIds.has(old.id)) {
          await request(
            `/api/admin/leads/${encodeURIComponent(old.id)}`,
            { method: "DELETE" },
            true
          );
        }
      }

      // CMS update/reset
      if (!sameJson(localCms, snapshots.cms)) {
        await request(
          "/api/admin/cms",
          { method: "PUT", body: JSON.stringify(localCms) },
          true
        );
      }

      // Booking availability update
      if (localAvailability && !sameJson(localAvailability, snapshots.availability)) {
        await request(
          "/api/admin/availability",
          { method: "PUT", body: JSON.stringify(localAvailability) },
          true
        );
      }

      snapshots = {
        bookings: structuredClone(localBookings),
        leads: structuredClone(localLeads),
        cms: structuredClone(localCms),
        availability: structuredClone(localAvailability)
      };
    } catch (error) {
      console.error("[PrevenTech Dashboard Sync] push:", error);
    } finally {
      syncing = false;
    }
  }

  window.addEventListener("storage", () => {
    if (suppressLocalChange) return;
    setTimeout(pushLocalChanges, 0);
  });

  if (apiReady()) {
    pullRemote();

    // استلام حجوزات ورسائل جديدة من زوار الموقع.
    setInterval(pullRemote, 15_000);
  } else {
    console.warn(
      "[PrevenTech Dashboard Sync] ضع رابط Worker الحقيقي داخل cloud-sync.js"
    );
  }

  window.PrevenTechDashboardCloud = {
    refresh: pullRemote,
    sync: pushLocalChanges,
    logoutApi: () => {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
      location.reload();
    }
  };
})();
