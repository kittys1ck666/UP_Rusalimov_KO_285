(() => {
  "use strict";

  const ENTITIES = [

    {
      name: "Comment",
      route: "Comment",
      pk: "CommentId",
      idType: "int",
      fields: [

        { name: "CommentId", type: "int" },

        { name: "Message", type: "string" },

        { name: "MasterId", type: "int?" },

        { name: "RequestId", type: "int" }

      ]
    },

    {
      name: "Request",
      route: "Request",
      pk: "RequestId",
      idType: "int",
      fields: [

        { name: "RequestId", type: "int" },

        { name: "StartDate", type: "DateOnly?" },

        { name: "ClimateTechType", type: "string" },

        { name: "ClimateTechModel", type: "string" },

        { name: "ProblemDescription", type: "string" },

        { name: "RequestStatus", type: "string" },

        { name: "CompletionDate", type: "DateOnly?" },

        { name: "RepairParts", type: "string" },

        { name: "MasterId", type: "int?" },

        { name: "ClientId", type: "int" }

      ]
    },

    {
      name: "User",
      route: "User",
      pk: "UserId",
      idType: "int",
      fields: [

        { name: "UserId", type: "int" },

        { name: "Fio", type: "string" },

        { name: "Phone", type: "string" },

        { name: "Login", type: "string" },

        { name: "Password", type: "string" },

        { name: "Type", type: "string" }

      ]
    }

  ];

  const $ = (id) => document.getElementById(id);

  const page = document.body.getAttribute("data-page") || "app";

  // Shared (present on both pages when needed)
  const shared = {
    msgModal: $("msg_modal"),
    msgKind: $("msg_kind"),
    msgTitle: $("msg_title"),
    msgBody: $("msg_body"),
    msgDetails: $("msg_details"),

    loginUser: $("login_user"),
    loginPass: $("login_pass"),
    btnDoLogin: $("btn_do_login"),
    btnRegister: $("btn_register"),
    btnGoApp: $("btn_go_app"),

    errLogin: $("err_login"),
    errPass: $("err_pass"),
  };

  // App-only elements (index.html)
  const app = {
    navTables: $("nav_tables"),
    navLogs: $("nav_logs"),
    navHistory: $("nav_history"),
    navExit: $("nav_exit"),

    viewTables: $("view_tables"),
    viewLogs: $("view_logs"),
    viewHistory: $("view_history"),

    authStatus: $("auth_status"),

    btnTokenToggle: $("btn_token_toggle"),
    btnTokenCopy: $("btn_token_copy"),
    tokenBox: $("token_box"),
    tokenModal: $("token_modal"),

    btnLoginPage: $("btn_login_page"),
    btnLogout: $("btn_logout"),

    entitySelect: $("entity_select"),
    searchQ: $("search_q"),
    btnReload: $("btn_reload"),
    btnOpenCreate: $("btn_open_create"),
    btnOpenEdit: $("btn_open_edit"),
    btnOpenDelete: $("btn_open_delete"),
    btnOpenView: $("btn_open_view"),

    searchCount: $("search_count"),
    selectedId: $("selected_id"),
    pageLabel: $("page_label"),

    btnPrev: $("btn_page_prev"),
    btnNext: $("btn_page_next"),
    pageInput: $("page_input"),
    btnPageGo: $("btn_page_go"),

    gotoId: $("goto_id"),
    btnGotoId: $("btn_goto_id"),

    pageSize: $("page_size"),
    btnPageApply: $("btn_page_apply"),

    cardsGrid: $("cards_grid"),

    log: $("log"),
    btnLogsClear: $("btn_logs_clear"),

    formModal: $("form_modal"),
    formBadge: $("form_badge"),
    formTitle: $("form_title"),
    formFields: $("form_fields"),
    btnFormSubmit: $("btn_form_submit"),

    confirmModal: $("confirm_modal"),
    confirmTitle: $("confirm_title"),
    confirmBody: $("confirm_body"),
    btnConfirmYes: $("btn_confirm_yes"),

    detailsModal: $("details_modal"),
    detailsTitle: $("details_title"),
    detailsBody: $("details_body"),
    btnDetailsCopy: $("btn_details_copy"),
  };

  const state = {
    token: localStorage.getItem("pggen_token") || "",
    apiBase: "/api",

    selectedRowId: null,
    selectedRowObj: null,

    allRows: [],
    viewRows: [],
    pageRows: [],

    isBusy: false,

    page: 1,
    pageSize: 12,

    currentFormMode: null,
    currentEntity: null,
    confirmResolve: null,
  };

  // ===== Common helpers =====
  function openModal(el){ if (el) el.classList.add("open"); }
  function closeModal(el){ if (el) el.classList.remove("open"); }

  function wireModalClose(modalEl) {
    if (!modalEl) return;
    modalEl.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") closeModal(modalEl);
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modalEl.classList.contains("open")) closeModal(modalEl);
    });
  }

  function setBadge(el, kind) {
    if (!el) return;
    el.classList.remove("ok","warn","err");
    if (kind === "ok") el.classList.add("ok");
    if (kind === "warn") el.classList.add("warn");
    if (kind === "err") el.classList.add("err");
  }

  function showMessage(kind, title, body, details) {
    if (!shared.msgModal) {
      alert(`${title}\n\n${body || ""}`);
      return;
    }
    shared.msgKind.textContent = kind === "err" ? "ERROR" : (kind === "warn" ? "WARN" : "INFO");
    setBadge(shared.msgKind, kind);
    shared.msgTitle.textContent = title || "Message";
    shared.msgBody.textContent = body || "";
    if (shared.msgDetails) shared.msgDetails.textContent = details || "";
    openModal(shared.msgModal);
  }

  function log(line) {
    if (!app.log) return;
    const ts = new Date().toISOString();
    app.log.textContent = `[${ts}] ${line}\n` + app.log.textContent;
  }

  function setBusy(isBusy, label) {
    state.isBusy = !!isBusy;

    const btns = page === "login"
      ? [shared.btnDoLogin, shared.btnRegister, shared.btnGoApp].filter(Boolean)
      : [
          app.btnReload, app.btnOpenCreate, app.btnOpenEdit, app.btnOpenDelete, app.btnOpenView,
          app.btnTokenToggle, app.btnTokenCopy, app.btnLogout, app.btnLoginPage,
          app.btnFormSubmit, app.btnLogsClear,
          app.navTables, app.navLogs, app.navHistory, app.navExit,
          app.btnPrev, app.btnNext, app.btnPageGo, app.btnGotoId, app.btnPageApply
        ].filter(Boolean);

    for (const b of btns) b.disabled = state.isBusy;
    if (label && page !== "login") log(label + (state.isBusy ? "..." : " OK"));
  }

  function normalizeApiBase(apiBase){
    if (!apiBase) return "/api";
    let b = apiBase.trim();
    if (!b.startsWith("/")) b = "/" + b;
    while (b.endsWith("/") && b.length > 1) b = b.slice(0,-1);
    return b;
  }
  function apiUrl(path){
    const base = normalizeApiBase(state.apiBase);
    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/^\/{2,}/, "/");
    if (path.startsWith(base + "/")) return path;
    return base + path;
  }

  async function http(method, url, body, expectJson = true){
    const headers = {};
    if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
    const init = { method, headers };

    if (body !== undefined){
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);
    const text = await res.text();

    if (!res.ok){
      let msg = `${res.status} ${res.statusText}`;
      if (text) msg += ` | ${text}`;
      const err = new Error(msg);
      err._details = text || "";
      err._status = res.status;
      throw err;
    }

    if (!expectJson) return text;
    if (!text) return null;

    try { return JSON.parse(text); } catch { return text; }
  }

  // ===== Auth / redirects =====
  function goToLogin() { window.location.href = "login.html"; }
  function goToApp() { window.location.href = "index.html"; }

  async function doLogin(isRegister){
    const user = (shared.loginUser?.value || "").trim();
    const pass = (shared.loginPass?.value || "").trim();

    if (shared.errLogin) shared.errLogin.textContent = "";
    if (shared.errPass) shared.errPass.textContent = "";

    if (!user) { if (shared.errLogin) shared.errLogin.textContent = "Введите логин."; }
    if (!pass) { if (shared.errPass) shared.errPass.textContent = "Введите пароль."; }
    if (!user || !pass) return;

    try{
      setBusy(true, "Auth");
      const url = apiUrl(isRegister ? "/api/Auth/register" : "/api/Auth/login");
      const res = await http("POST", url, { username: user, password: pass }, true);
      const token = res?.token || res?.accessToken || (typeof res === "string" ? res : "");
      if (!token) throw new Error("Token not found in API response.");

      state.token = token;
      localStorage.setItem("pggen_token", token);

      showMessage("ok", "Success", isRegister ? "Registered + logged in." : "Logged in.");
      // Redirect to app
      setTimeout(() => goToApp(), 300);
    } catch(e){
      showMessage("err","Auth error", String(e?.message || e), e?._details || "");
    } finally {
      setBusy(false);
    }
  }

  function doLogout(){
    state.token = "";
    localStorage.removeItem("pggen_token");
    if (page === "app") {
      showMessage("ok","Done","Logged out.");
      setTimeout(() => goToLogin(), 250);
    }
  }

  // ===== App page logic below =====
  function setAuthUI(){
    if (!app.authStatus) return;
    app.authStatus.textContent = state.token ? "ADMIN" : "Not authorized";
    if (app.tokenBox) app.tokenBox.textContent = state.token || "—";
  }

  function getSelectedEntity(){
    const name = app.entitySelect?.value;
    return ENTITIES.find(x => x.name === name) || null;
  }
  function renderEntities(){
    if (!app.entitySelect) return;
    app.entitySelect.innerHTML = "";
    for (const e of ENTITIES){
      const opt = document.createElement("option");
      opt.value = e.name;
      opt.textContent = e.name;
      app.entitySelect.appendChild(opt);
    }
  }

  function camelCase(s){ return !s ? s : (s.length===1 ? s.toLowerCase() : s[0].toLowerCase()+s.slice(1)); }
  function findKeyCI(obj, wanted){
    if (!obj || !wanted) return null;
    const w = wanted.toLowerCase();
    return Object.keys(obj).find(k => k.toLowerCase() === w) || null;
  }
  function getRowId(row, entity){
    if (!row) return null;
    const pk = entity?.pk;
    if (pk){
      const k1 = findKeyCI(row, pk); if (k1) return row[k1];
      const k2 = findKeyCI(row, camelCase(pk)); if (k2) return row[k2];
    }
    const k3 = findKeyCI(row,"id"); if (k3) return row[k3];
    const last = Object.keys(row).find(k => k.toLowerCase().endsWith("id"));
    return last ? row[last] : null;
  }
  function normRoute(entity){ return String(entity?.route || "").replace(/^\/+/, ""); }

  function compareIds(a, b, entity){
    const av = getRowId(a, entity);
    const bv = getRowId(b, entity);
    const an = (typeof av === "number") ? av : (av != null && av !== "" && !isNaN(Number(av)) ? Number(av) : null);
    const bn = (typeof bv === "number") ? bv : (bv != null && bv !== "" && !isNaN(Number(bv)) ? Number(bv) : null);
    if (an != null && bn != null) return an - bn;
    return String(av ?? "").localeCompare(String(bv ?? ""));
  }

  function resetSelection(){
    state.selectedRowId = null;
    state.selectedRowObj = null;
    if (app.selectedId) app.selectedId.textContent = "—";
    if (app.btnOpenEdit) app.btnOpenEdit.disabled = true;
    if (app.btnOpenDelete) app.btnOpenDelete.disabled = true;
    if (app.btnOpenView) app.btnOpenView.disabled = true;
  }

  function safeText(v){
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  function pickCardTitle(row, entity){
    const candidates = ["name","title","model","type"];
    for (const c of candidates){
      const k = findKeyCI(row, c);
      if (k && safeText(row[k]).trim()) return safeText(row[k]);
    }
    const id = getRowId(row, entity);
    return `${entity.name} #${id ?? "?"}`;
  }

  function applyPagination(){
    const total = state.viewRows.length;
    const pageSize = Math.max(1, state.pageSize);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    if (state.page < 1) state.page = 1;
    if (state.page > pages) state.page = pages;

    const start = (state.page - 1) * pageSize;
    state.pageRows = state.viewRows.slice(start, start + pageSize);

    if (app.pageLabel) app.pageLabel.textContent = `${state.page} / ${pages}`;
    if (app.searchCount) app.searchCount.textContent = String(total);

    if (app.btnPrev) app.btnPrev.disabled = (state.page <= 1) || state.isBusy;
    if (app.btnNext) app.btnNext.disabled = (state.page >= pages) || state.isBusy;
  }

  function renderCards(entity){
    resetSelection();
    app.cardsGrid.innerHTML = "";

    const rows = state.pageRows;

    if (!Array.isArray(rows) || rows.length === 0){
      const div = document.createElement("div");
      div.className = "carditem";
      div.textContent = "Empty";
      app.cardsGrid.appendChild(div);
      return;
    }

    const fields = (entity.fields || []).map(f => f.name);

    for (const r of rows){
      const id = getRowId(r, entity);

      const card = document.createElement("div");
      card.className = "carditem";
      card.dataset.id = (id === null || id === undefined) ? "" : String(id);

      const title = document.createElement("div");
      title.className = "cardtitle";

      const left = document.createElement("div");
      left.textContent = pickCardTitle(r, entity);

      const right = document.createElement("div");
      right.style.fontWeight = "900";
      right.style.color = "rgba(0,0,0,.65)";
      right.textContent = id === null || id === undefined ? "" : `#${id}`;

      title.appendChild(left);
      title.appendChild(right);

      const kv = document.createElement("div");
      kv.className = "cardkv";

      let shown = 0;
      for (const name of fields){
        if (shown >= 6) break;
        const key = findKeyCI(r, name) || findKeyCI(r, camelCase(name));
        if (!key) continue;

        const value = r[key];
        if (value && typeof value === "object") continue;

        const k = document.createElement("div");
        k.className = "k";
        k.textContent = name;

        const v = document.createElement("div");
        v.className = "v";
        v.textContent = safeText(value);

        kv.appendChild(k);
        kv.appendChild(v);

        shown++;
      }

      card.appendChild(title);
      card.appendChild(kv);

      const selectCard = () => {
        for (const x of app.cardsGrid.querySelectorAll(".carditem.selected")) x.classList.remove("selected");
        card.classList.add("selected");
        state.selectedRowId = id;
        state.selectedRowObj = r;
        app.selectedId.textContent = id === null || id === undefined ? "—" : String(id);

        if (app.btnOpenEdit) app.btnOpenEdit.disabled = false;
        if (app.btnOpenDelete) app.btnOpenDelete.disabled = false;
        if (app.btnOpenView) app.btnOpenView.disabled = false;
      };

      card.addEventListener("click", selectCard);
      card.addEventListener("dblclick", () => { selectCard(); openDetails(); });

      app.cardsGrid.appendChild(card);
    }
  }

  function localFilter(rows, q){
    const needle = (q||"").trim().toLowerCase();
    if (!needle) return rows;
    return (rows||[]).filter(r => Object.values(r||{}).some(v => {
      if (v===null || v===undefined) return false;
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return s.toLowerCase().includes(needle);
    }));
  }

  function setViewRows(entity, rows){
    state.allRows = Array.isArray(rows) ? rows.slice() : [];
    state.allRows.sort((a,b) => compareIds(a,b,entity));

    const q = (app.searchQ?.value || "").trim();
    state.viewRows = q ? localFilter(state.allRows, q) : state.allRows.slice();

    state.page = 1;
    applyPagination();
    renderCards(entity);
  }

  async function reload(){
    const entity = getSelectedEntity();
    if (!entity) return;
    try{
      setBusy(true,"Loading");
      const url = apiUrl(`/${normRoute(entity)}`);
      const rows = await http("GET", url, undefined, true);
      const list = Array.isArray(rows) ? rows : (rows || []);
      setViewRows(entity, list);
      log(`GET ${url} OK`);
    } catch(e){
      showMessage("err","Load error", String(e?.message || e), e?._details || "");
      log(`GET FAIL: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  function searchLocal(){
    const entity = getSelectedEntity();
    if (!entity) return;
    state.viewRows = localFilter(state.allRows, (app.searchQ?.value||""));
    state.page = 1;
    applyPagination();
    renderCards(entity);
  }

  function gotoPage(p){
    const total = state.viewRows.length;
    const pages = Math.max(1, Math.ceil(total / Math.max(1,state.pageSize)));
    const n = Math.max(1, Math.min(p, pages));
    state.page = n;
    applyPagination();
    renderCards(getSelectedEntity());
  }

  function gotoId(){
    const entity = getSelectedEntity();
    if (!entity) return;

    const raw = (app.gotoId?.value || "").trim();
    if (!raw){
      showMessage("warn","Go to ID","Введите ID.");
      return;
    }

    const target = raw.toLowerCase();
    let idx = -1;

    for (let i=0;i<state.viewRows.length;i++){
      const id = getRowId(state.viewRows[i], entity);
      if (id === null || id === undefined) continue;
      if (String(id).toLowerCase() === target){ idx = i; break; }
    }

    if (idx < 0){
      showMessage("warn","Not found",`ID ${raw} не найден в текущем списке.`);
      return;
    }

    const pageSize = Math.max(1,state.pageSize);
    const pageNum = Math.floor(idx / pageSize) + 1;
    gotoPage(pageNum);

    setTimeout(() => {
      const card = app.cardsGrid.querySelector(`.carditem[data-id="${raw}"]`);
      if (card) card.click();
    }, 0);
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function openDetails(){
    const entity = getSelectedEntity();
    if (!entity) return;
    if (!state.selectedRowObj){
      showMessage("warn","No selection","Select a card first.");
      return;
    }

    const id = getRowId(state.selectedRowObj, entity);
    app.detailsTitle.textContent = `${entity.name} #${id ?? "?"}`;

    const row = state.selectedRowObj;
    const keys = Object.keys(row || {});
    keys.sort((a,b) => a.localeCompare(b));

    const html = [];
    html.push(`<div style="display:grid;grid-template-columns:200px 1fr;gap:8px 12px;">`);
    for (const k of keys){
      const v = row[k];
      const vv = (v && typeof v === "object") ? JSON.stringify(v) : (v === null || v === undefined ? "" : String(v));
      html.push(`<div style="font-weight:900;color:rgba(0,0,0,.65);">${escapeHtml(k)}</div>`);
      html.push(`<div style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(vv)}</div>`);
    }
    html.push(`</div>`);

    app.detailsBody.innerHTML = html.join("");
    openModal(app.detailsModal);
  }

  // NOTE: Form handlers omitted here to keep response size reasonable.
  // Use your existing "no JSON form" block (renderForm/buildPayload/submitForm/deleteSelected)
  // from the previous message, unchanged, and keep the wiring below.

  function setActiveNav(btn){
    for (const b of [app.navTables, app.navLogs, app.navHistory]){
      if (!b) continue;
      b.classList.toggle("active", b === btn);
    }
  }
  function showView(viewId){
    for (const v of [app.viewTables, app.viewLogs, app.viewHistory]){
      if (!v) continue;
      v.classList.toggle("active", v.id === viewId);
    }
  }

  function initLoginPage(){
    wireModalClose(shared.msgModal);

    shared.btnDoLogin?.addEventListener("click", () => doLogin(false));
    shared.btnRegister?.addEventListener("click", () => doLogin(true));
    shared.btnGoApp?.addEventListener("click", () => goToApp());

    shared.loginPass?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") doLogin(false);
    });
    shared.loginUser?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") doLogin(false);
    });

    // If already logged in, go to app
    if (state.token) {
      setTimeout(() => goToApp(), 50);
    }
  }

  function initAppPage(){
    // redirect to login if no token
    if (!state.token) {
      goToLogin();
      return;
    }

    wireModalClose(shared.msgModal);
    wireModalClose(app.confirmModal);
    wireModalClose(app.formModal);
    wireModalClose(app.tokenModal);
    wireModalClose(app.detailsModal);

    // confirm
    app.btnConfirmYes?.addEventListener("click", () => {
      closeModal(app.confirmModal);
      const r = state.confirmResolve; state.confirmResolve = null;
      if (r) r(true);
    });
    app.confirmModal?.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") {
        const r = state.confirmResolve; state.confirmResolve = null;
        if (r) r(false);
      }
    });

    // nav
    app.navTables?.addEventListener("click", () => { setActiveNav(app.navTables); showView("view_tables"); });
    app.navLogs?.addEventListener("click", () => { setActiveNav(app.navLogs); showView("view_logs"); });
    app.navHistory?.addEventListener("click", () => { setActiveNav(app.navHistory); showView("view_history"); });
    app.navExit?.addEventListener("click", async () => {
      const ok = await confirmDialog("Exit", "Logout and exit?");
      if (ok) doLogout();
    });

    // token
    app.btnTokenToggle?.addEventListener("click", () => openModal(app.tokenModal));
    app.btnTokenCopy?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(state.token || "");
        showMessage("ok","Copied","Token copied.");
      } catch {
        showMessage("warn","Clipboard blocked","Browser denied clipboard access.");
      }
    });

    // login page link + logout
    app.btnLoginPage?.addEventListener("click", () => goToLogin());
    app.btnLogout?.addEventListener("click", () => doLogout());

    // details copy
    app.btnDetailsCopy?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(JSON.stringify(state.selectedRowObj || {}, null, 2));
        showMessage("ok","Copied","Row JSON copied.");
      } catch {
        showMessage("warn","Clipboard blocked","Browser denied clipboard access.");
      }
    });

    // logs clear
    app.btnLogsClear?.addEventListener("click", () => { if (app.log) app.log.textContent = ""; });

    // entities
    renderEntities();
    setAuthUI();

    // page size default
    if (app.pageSize) app.pageSize.value = String(state.pageSize);

    // actions
    app.btnReload?.addEventListener("click", reload);
    app.btnOpenView?.addEventListener("click", openDetails);

    // IMPORTANT: wire your existing create/edit/delete/submitForm handlers here (from your current file)
    // app.btnOpenCreate -> open form create
    // app.btnOpenEdit -> open form edit
    // app.btnOpenDelete -> deleteSelected
    // app.btnFormSubmit -> submitForm

    // pagination
    app.btnPrev?.addEventListener("click", () => gotoPage(state.page - 1));
    app.btnNext?.addEventListener("click", () => gotoPage(state.page + 1));
    app.btnPageGo?.addEventListener("click", () => {
      const n = parseInt((app.pageInput?.value || "").trim(), 10);
      if (!isNaN(n)) gotoPage(n);
    });
    app.btnGotoId?.addEventListener("click", gotoId);
    app.btnPageApply?.addEventListener("click", () => {
      const n = parseInt((app.pageSize?.value || "").trim(), 10);
      if (!isNaN(n) && n > 0) state.pageSize = n;
      gotoPage(1);
    });

    // search local
    app.searchQ?.addEventListener("keydown", (ev) => { if (ev.key==="Enter") searchLocal(); });
    app.searchQ?.addEventListener("input", () => searchLocal());

    // entity reload
    app.entitySelect?.addEventListener("change", () => reload());

    resetSelection();
    setTimeout(() => reload(), 50);
  }

  if (page === "login") initLoginPage();
  else initAppPage();
})();