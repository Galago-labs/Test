// ── Main Module (Розетка) ────────────────────────────────────────
// Координация всех модулей. Главный цикл событий.

mod winapi;
mod buffer;

use winapi::*;
use buffer::{TextBuffer, CursorPos};

use std::ptr;
use std::mem;

// ── Constants ─────────────────────────────────────────────────────
const WIN_W: i32 = 800;
const WIN_H: i32 = 600;
const TITLE_H: i32 = 32;
const STATUS_H: i32 = 24;
const MIN_WIN_W: i32 = 400;
const MIN_WIN_H: i32 = 300;

const TIMER_ID_CURSOR: usize = 1;
const CURSOR_BLINK_MS: u32 = 530;

// ── Fonts ────────────────────────────────────────────────────────
struct Fonts {
    title: HFONT,
    status: HFONT,
    text: HFONT,
}

impl Fonts {
    fn null() -> Self {
        Fonts {
            title: ptr::null_mut(),
            status: ptr::null_mut(),
            text: ptr::null_mut(),
        }
    }

    unsafe fn load() -> Self {
        let face = to_wstring("Consolas");
        Fonts {
            title: CreateFontW(16, 0, 0, 0, FW_NORMAL, 0, 0, 0,
                ANSI_CHARSET as DWORD, OUT_TT_PRECIS as DWORD,
                CLIP_DEFAULT_PRECIS as DWORD, CLEARTYPE_QUALITY as DWORD,
                (VARIABLE_PITCH | FF_SWISS) as DWORD, face.as_ptr()),
            status: CreateFontW(12, 0, 0, 0, FW_NORMAL, 0, 0, 0,
                ANSI_CHARSET as DWORD, OUT_TT_PRECIS as DWORD,
                CLIP_DEFAULT_PRECIS as DWORD, CLEARTYPE_QUALITY as DWORD,
                (VARIABLE_PITCH | FF_SWISS) as DWORD, face.as_ptr()),
            text: CreateFontW(14, 0, 0, 0, FW_NORMAL, 0, 0, 0,
                ANSI_CHARSET as DWORD, OUT_TT_PRECIS as DWORD,
                CLIP_DEFAULT_PRECIS as DWORD, CLEARTYPE_QUALITY as DWORD,
                (VARIABLE_PITCH | FF_SWISS) as DWORD, face.as_ptr()),
        }
    }

    unsafe fn free(&self) {
        for &f in &[self.title, self.status, self.text] {
            if !f.is_null() {
                DeleteObject(f as HGDIOBJ);
            }
        }
    }
}

// ── App State ────────────────────────────────────────────────────
struct AppState {
    buffer: TextBuffer,
    fonts: Fonts,
    file_path: Option<String>,
    cursor_visible: bool,
    has_focus: bool,
    hovered_btn: Option<BtnType>,
    pressed_btn: Option<BtnType>,
    scroll_y: i32,
    scroll_max: i32,
    line_height: i32,
    visible_lines: usize,
}

#[derive(Clone, Copy, PartialEq)]
enum BtnType {
    Close,
    Minimize,
}

impl AppState {
    fn new() -> Self {
        AppState {
            buffer: TextBuffer::new(),
            fonts: Fonts::null(),
            file_path: None,
            cursor_visible: true,
            has_focus: false,
            hovered_btn: None,
            pressed_btn: None,
            scroll_y: 0,
            scroll_max: 0,
            line_height: 16,
            visible_lines: 0,
        }
    }

    fn get_title(&self) -> String {
        match &self.file_path {
            Some(path) => {
                let file_name = path.split('\\').last().unwrap_or(path);
                if self.buffer.is_modified() {
                    format!("*{} - Notepad-NG", file_name)
                } else {
                    format!("{} - Notepad-NG", file_name)
                }
            }
            None => {
                if self.buffer.is_modified() {
                    "*Безымянный - Notepad-NG".to_string()
                } else {
                    "Безымянный - Notepad-NG".to_string()
                }
            }
        }
    }

    fn update_scroll(&mut self, client_h: i32) {
        let text_area_h = client_h - TITLE_H - STATUS_H;
        self.visible_lines = (text_area_h / self.line_height) as usize;
        let total_lines = self.buffer.line_count();
        
        if total_lines > self.visible_lines {
            self.scroll_max = (total_lines - self.visible_lines) as i32;
            self.scroll_y = self.scroll_y.min(self.scroll_max);
        } else {
            self.scroll_max = 0;
            self.scroll_y = 0;
        }
    }

    fn ensure_cursor_visible(&mut self, client_h: i32) {
        let cursor_line = self.buffer.cursor_pos().line;
        let text_area_h = client_h - TITLE_H - STATUS_H;
        let visible_lines = (text_area_h / self.line_height) as usize;

        if cursor_line as i32 < self.scroll_y {
            self.scroll_y = cursor_line as i32;
        } else if cursor_line as i32 >= self.scroll_y + visible_lines as i32 {
            self.scroll_y = (cursor_line - visible_lines + 1) as i32;
        }
        self.scroll_y = self.scroll_y.max(0).min(self.scroll_max);
    }
}

// ── Drawing Helpers ──────────────────────────────────────────────
unsafe fn draw_rect(hdc: HDC, r: &RECT, fill: COLORREF) {
    let brush = CreateSolidBrush(fill);
    FillRect(hdc, r, brush);
    DeleteObject(brush as HGDIOBJ);
}

unsafe fn draw_text(hdc: HDC, text: &str, mut r: RECT, font: HFONT, color: COLORREF, flags: UINT) {
    let of = SelectObject(hdc, font as HGDIOBJ);
    SetTextColor(hdc, color);
    SetBkMode(hdc, 1);
    let ws = to_wstring(text);
    DrawTextW(hdc, ws.as_ptr(), -1, &mut r, flags);
    SelectObject(hdc, of);
}

unsafe fn draw_line(hdc: HDC, x1: i32, y1: i32, x2: i32, y2: i32, color: COLORREF) {
    let pen = CreatePen(PS_SOLID, 1, color);
    let op = SelectObject(hdc, pen as HGDIOBJ);
    MoveToEx(hdc, x1, y1, ptr::null_mut());
    LineTo(hdc, x2, y2);
    SelectObject(hdc, op);
    DeleteObject(pen as HGDIOBJ);
}

fn close_btn_rect(cw: i32) -> RECT {
    RECT { left: cw - 50, top: 6, right: cw - 10, bottom: TITLE_H - 6 }
}

fn min_btn_rect(cw: i32) -> RECT {
    RECT { left: cw - 90, top: 6, right: cw - 56, bottom: TITLE_H - 6 }
}

fn in_rect(mx: i32, my: i32, r: &RECT) -> bool {
    mx >= r.left && mx < r.right && my >= r.top && my < r.bottom
}

// ── Clipboard ────────────────────────────────────────────────────
unsafe fn copy_to_clipboard(hwnd: HWND, text: &str) {
    let ws = to_wstring(text);
    let hmem = GlobalAlloc(GMEM_MOVEABLE, ws.len() * 2);
    if hmem.is_null() { return; }
    let ptra = GlobalLock(hmem) as *mut u16;
    if ptra.is_null() { return; }
    ptr::copy_nonoverlapping(ws.as_ptr(), ptra, ws.len());
    GlobalUnlock(hmem);
    if OpenClipboard(hwnd) != 0 {
        EmptyClipboard();
        SetClipboardData(CF_UNICODETEXT, hmem);
        CloseClipboard();
    }
}

unsafe fn paste_from_clipboard() -> Option<String> {
    if IsClipboardFormatAvailable(CF_UNICODETEXT) == 0 {
        return None;
    }
    if OpenClipboard(ptr::null_mut()) == 0 {
        return None;
    }
    let hmem = GetClipboardData(CF_UNICODETEXT);
    if hmem.is_null() {
        CloseClipboard();
        return None;
    }
    let ptr = GlobalLock(hmem) as *const u16;
    if ptr.is_null() {
        CloseClipboard();
        return None;
    }
    let s = wstring_to_string(ptr);
    GlobalUnlock(hmem);
    CloseClipboard();
    Some(s)
}

// ── File Dialogs ─────────────────────────────────────────────────
unsafe fn show_open_dialog(hwnd: HWND) -> Option<String> {
    let mut file_buf = vec![0u16; 2048];
    let mut title_buf = vec![0u16; 1024];
    
    let filter = to_wstring("Текстовые файлы\0*.txt\0Все файлы\0*.*\0\0");
    
    let mut ofn = OPENFILENAMEW {
        lStructSize: mem::size_of::<OPENFILENAMEW>() as DWORD,
        hwndOwner: hwnd,
        hInstance: ptr::null_mut(),
        lpstrFilter: filter.as_ptr(),
        lpstrCustomFilter: ptr::null_mut(),
        nMaxCustFilter: 0,
        nFilterIndex: 1,
        lpstrFile: file_buf.as_mut_ptr(),
        nMaxFile: file_buf.len() as DWORD,
        lpstrFileTitle: title_buf.as_mut_ptr(),
        nMaxFileTitle: title_buf.len() as DWORD,
        lpstrInitialDir: ptr::null(),
        lpstrTitle: ptr::null(),
        Flags: OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST | OFN_EXPLORER | OFN_LONGNAMES | OFN_NOCHANGEDIR,
        nFileOffset: 0,
        nFileExtension: 0,
        lpstrDefExt: ptr::null(),
        lCustData: 0,
        lpfnHook: None,
        lpTemplateName: ptr::null(),
        pvReserved: ptr::null_mut(),
        dwReserved: 0,
        FlagsEx: 0,
    };

    if GetOpenFileNameW(&mut ofn) != 0 {
        Some(wstring_to_string(file_buf.as_ptr()))
    } else {
        None
    }
}

unsafe fn show_save_dialog(hwnd: HWND) -> Option<String> {
    let mut file_buf = vec![0u16; 2048];
    let mut title_buf = vec![0u16; 1024];
    
    let filter = to_wstring("Текстовые файлы\0*.txt\0Все файлы\0*.*\0\0");
    
    let mut ofn = OPENFILENAMEW {
        lStructSize: mem::size_of::<OPENFILENAMEW>() as DWORD,
        hwndOwner: hwnd,
        hInstance: ptr::null_mut(),
        lpstrFilter: filter.as_ptr(),
        lpstrCustomFilter: ptr::null_mut(),
        nMaxCustFilter: 0,
        nFilterIndex: 1,
        lpstrFile: file_buf.as_mut_ptr(),
        nMaxFile: file_buf.len() as DWORD,
        lpstrFileTitle: title_buf.as_mut_ptr(),
        nMaxFileTitle: title_buf.len() as DWORD,
        lpstrInitialDir: ptr::null(),
        lpstrTitle: ptr::null(),
        Flags: OFN_OVERWRITEPROMPT | OFN_EXPLORER | OFN_LONGNAMES | OFN_NOCHANGEDIR,
        nFileOffset: 0,
        nFileExtension: 0,
        lpstrDefExt: to_wstring("txt").as_ptr(),
        lCustData: 0,
        lpfnHook: None,
        lpTemplateName: ptr::null(),
        pvReserved: ptr::null_mut(),
        dwReserved: 0,
        FlagsEx: 0,
    };

    if GetSaveFileNameW(&mut ofn) != 0 {
        Some(wstring_to_string(file_buf.as_ptr()))
    } else {
        None
    }
}

use std::fs;

unsafe fn load_file(path: &str) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

unsafe fn save_file(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

// ── Paint ────────────────────────────────────────────────────────
unsafe fn paint(hwnd: HWND, state: &mut AppState) {
    let mut ps: PAINTSTRUCT = mem::zeroed();
    let hdc_win = BeginPaint(hwnd, &mut ps);
    
    let mut cr: RECT = mem::zeroed();
    GetClientRect(hwnd, &mut cr);
    let (cw, ch) = (cr.right, cr.bottom);

    let mem_dc = CreateCompatibleDC(hdc_win);
    let hbm = CreateCompatibleBitmap(hdc_win, cw, ch);
    let old_bm = SelectObject(mem_dc, hbm);

    let bg_r = RECT { left: 0, top: 0, right: cw, bottom: ch };
    draw_rect(mem_dc, &bg_r, BG_COLOR);

    let title_r = RECT { left: 0, top: 0, right: cw, bottom: TITLE_H };
    draw_rect(mem_dc, &title_r, TITLE_BG);
    
    let title_txt_r = RECT { left: 10, top: 0, right: cw - 100, bottom: TITLE_H };
    draw_text(mem_dc, &state.get_title(), title_txt_r, state.fonts.title, TEXT_GRAY, DT_LEFT | DT_SINGLELINE | DT_VCENTER);

    {
        let r = close_btn_rect(cw);
        let fill = if state.pressed_btn == Some(BtnType::Close) { 0x001111AA } 
                   else if state.hovered_btn == Some(BtnType::Close) { 0x002222CC } 
                   else { TITLE_BG };
        draw_rect(mem_dc, &r, fill);
        draw_text(mem_dc, "✕", r, state.fonts.title, TEXT_GRAY, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
    }

    {
        let r = min_btn_rect(cw);
        let fill = if state.pressed_btn == Some(BtnType::Minimize) { 0x00303030 }
                   else if state.hovered_btn == Some(BtnType::Minimize) { 0x00404040 }
                   else { TITLE_BG };
        draw_rect(mem_dc, &r, fill);
        draw_text(mem_dc, "—", r, state.fonts.title, TEXT_GRAY, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
    }

    draw_line(mem_dc, 0, TITLE_H, cw, TITLE_H, SEPARATOR);

    let text_top = TITLE_H;
    let text_bottom = ch - STATUS_H;
    
    let mut line_y = text_top - state.scroll_y * state.line_height;
    let line_count = state.buffer.line_count();
    
    for i in 0..line_count {
        if line_y > text_bottom {
            break;
        }
        if line_y + state.line_height < text_top {
            line_y += state.line_height;
            continue;
        }

        let line_str = state.buffer.lines[i].clone();
        
        if let Some((sel_start, sel_end)) = state.buffer.get_selection_range() {
            if i > sel_start.line && i < sel_end.line {
                let sel_r = RECT { left: 5, top: line_y, right: cw - 5, bottom: line_y + state.line_height };
                draw_rect(mem_dc, &sel_r, 0x00444466);
            } else if i == sel_start.line && i == sel_end.line {
                let start_x = 5 + sel_start.col as i32 * 8;
                let end_x = 5 + sel_end.col as i32 * 8;
                
                if start_x < end_x {
                    let sel_r = RECT { left: start_x, top: line_y, right: end_x, bottom: line_y + state.line_height };
                    draw_rect(mem_dc, &sel_r, 0x00444466);
                }
            } else if i == sel_start.line {
                let start_x = 5 + sel_start.col as i32 * 8;
                let sel_r = RECT { left: start_x, top: line_y, right: cw - 5, bottom: line_y + state.line_height };
                draw_rect(mem_dc, &sel_r, 0x00444466);
            } else if i == sel_end.line {
                let end_x = 5 + sel_end.col as i32 * 8;
                let sel_r = RECT { left: 5, top: line_y, right: end_x, bottom: line_y + state.line_height };
                draw_rect(mem_dc, &sel_r, 0x00444466);
            }
        }

        let text_draw_r = RECT { left: 5, top: line_y, right: cw - 5, bottom: line_y + state.line_height };
        draw_text(mem_dc, &line_str, text_draw_r, state.fonts.text, TEXT_WHITE, DT_LEFT | DT_SINGLELINE | DT_NOCLIP);

        if state.has_focus && state.cursor_visible && i == state.buffer.cursor_pos().line {
            let cursor_col = state.buffer.cursor_pos().col;
            let cursor_x = 5 + cursor_col as i32 * 8;
            let cursor_r = RECT { left: cursor_x, top: line_y + 2, right: cursor_x + 1, bottom: line_y + state.line_height - 2 };
            draw_rect(mem_dc, &cursor_r, 0x00FFAA00);
        }

        line_y += state.line_height;
    }

    let status_top = ch - STATUS_H;
    let status_r = RECT { left: 0, top: status_top, right: cw, bottom: ch };
    draw_rect(mem_dc, &status_r, 0x00252525);
    
    draw_line(mem_dc, 0, status_top, cw, status_top, SEPARATOR);
    
    let cursor_pos = state.buffer.cursor_pos();
    let line_num = cursor_pos.line + 1;
    let col_num = cursor_pos.col + 1;
    let char_count = state.buffer.char_count();
    let status_text = format!("Строка: {}  Столбец: {}  Символов: {}", line_num, col_num, char_count);
    let status_txt_r = RECT { left: 10, top: status_top, right: cw - 10, bottom: ch };
    draw_text(mem_dc, &status_text, status_txt_r, state.fonts.status, TEXT_GRAY, DT_LEFT | DT_SINGLELINE | DT_VCENTER);

    BitBlt(hdc_win, 0, 0, cw, ch, mem_dc, 0, 0, SRCCOPY);
    
    SelectObject(mem_dc, old_bm);
    DeleteObject(hbm);
    DeleteDC(mem_dc);
    
    EndPaint(hwnd, &ps);
}

// ── Window Procedure ─────────────────────────────────────────────
unsafe extern "system" fn wnd_proc(hwnd: HWND, msg: UINT, wp: WPARAM, lp: LPARAM) -> LRESULT {
    let sp = GetWindowLongPtrW(hwnd, GWLP_USERDATA) as *mut AppState;

    match msg {
        WM_CREATE => {
            PostMessageW(hwnd, WM_SETFOCUS, 0, 0);
            0
        }

        WM_SIZE => {
            if !sp.is_null() {
                let s = &mut *sp;
                let ch = lp as i32 & 0xFFFF;
                s.update_scroll(ch);
                s.ensure_cursor_visible(ch);
                InvalidateRect(hwnd, ptr::null(), 0);
            }
            0
        }

        WM_SETFOCUS => {
            if !sp.is_null() {
                let s = &mut *sp;
                s.has_focus = true;
                s.cursor_visible = true;
                SetTimer(hwnd, TIMER_ID_CURSOR, CURSOR_BLINK_MS, None);
                InvalidateRect(hwnd, ptr::null(), 0);
            }
            0
        }

        WM_KILLFOCUS => {
            if !sp.is_null() {
                let s = &mut *sp;
                s.has_focus = false;
                s.cursor_visible = false;
                KillTimer(hwnd, TIMER_ID_CURSOR);
                InvalidateRect(hwnd, ptr::null(), 0);
            }
            0
        }

        WM_TIMER => {
            if wp == TIMER_ID_CURSOR && !sp.is_null() {
                let s = &mut *sp;
                if s.has_focus {
                    s.cursor_visible = !s.cursor_visible;
                    InvalidateRect(hwnd, ptr::null(), 0);
                }
            }
            0
        }

        WM_NCHITTEST => {
            let mut pt = POINT::default();
            GetCursorPos(&mut pt);
            ScreenToClient(hwnd, &mut pt);
            
            if pt.y >= 0 && pt.y < TITLE_H {
                let close_r = close_btn_rect(WIN_W);
                let min_r = min_btn_rect(WIN_W);
                if !in_rect(pt.x, pt.y, &close_r) && !in_rect(pt.x, pt.y, &min_r) {
                    return HTCAPTION;
                }
            }
            HTCLIENT
        }

        WM_PAINT => {
            if !sp.is_null() {
                paint(hwnd, &mut *sp);
            } else {
                let mut ps: PAINTSTRUCT = mem::zeroed();
                BeginPaint(hwnd, &mut ps);
                EndPaint(hwnd, &ps);
            }
            0
        }

        WM_ERASEBKGND => 1,

        WM_MOUSEMOVE => {
            if sp.is_null() { return DefWindowProcW(hwnd, msg, wp, lp); }
            let s = &mut *sp;
            let mx = (lp & 0xFFFF) as i16 as i32;
            let my = ((lp >> 16) & 0xFFFF) as i16 as i32;

            let close_r = close_btn_rect(WIN_W);
            let min_r = min_btn_rect(WIN_W);

            let close_hover = in_rect(mx, my, &close_r);
            let min_hover = in_rect(mx, my, &min_r);

            let new_hover = if close_hover {
                Some(BtnType::Close)
            } else if min_hover {
                Some(BtnType::Minimize)
            } else {
                None
            };

            if s.hovered_btn != new_hover {
                s.hovered_btn = new_hover;
                InvalidateRect(hwnd, ptr::null(), 0);
            }

            if wp & 1 == 1 {
                let text_top = TITLE_H;
                let text_bottom = WIN_H - STATUS_H;
                if my > text_top && my < text_bottom {
                    let line_idx = ((my - text_top) as i32 + s.scroll_y * s.line_height) / s.line_height;
                    let line_idx = line_idx.min(s.buffer.line_count() as i32 - 1).max(0) as usize;
                    let col_idx = ((mx - 5) / 8).max(0) as usize;
                    let col_idx = col_idx.min(s.buffer.line_length(line_idx));
                    
                    s.buffer.extend_selection(CursorPos { line: line_idx, col: col_idx });
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                }
            }

            0
        }

        WM_LBUTTONDOWN => {
            if sp.is_null() { return DefWindowProcW(hwnd, msg, wp, lp); }
            let s = &mut *sp;
            let mx = (lp & 0xFFFF) as i16 as i32;
            let my = ((lp >> 16) & 0xFFFF) as i16 as i32;

            let close_r = close_btn_rect(WIN_W);
            let min_r = min_btn_rect(WIN_W);

            if in_rect(mx, my, &close_r) {
                s.pressed_btn = Some(BtnType::Close);
                InvalidateRect(hwnd, ptr::null(), 0);
                return 0;
            }
            if in_rect(mx, my, &min_r) {
                s.pressed_btn = Some(BtnType::Minimize);
                InvalidateRect(hwnd, ptr::null(), 0);
                return 0;
            }

            let text_top = TITLE_H;
            let text_bottom = WIN_H - STATUS_H;
            if my > text_top && my < text_bottom {
                let line_idx = ((my - text_top) as i32 + s.scroll_y * s.line_height) / s.line_height;
                let line_idx = line_idx.min(s.buffer.line_count() as i32 - 1).max(0) as usize;
                let col_idx = ((mx - 5) / 8).max(0) as usize;
                let col_idx = col_idx.min(s.buffer.line_length(line_idx));
                
                s.buffer.set_cursor(CursorPos { line: line_idx, col: col_idx });
                s.buffer.start_selection();
                SetFocus(hwnd);
                InvalidateRect(hwnd, ptr::null(), 0);
            }

            0
        }

        WM_LBUTTONUP => {
            if sp.is_null() { return DefWindowProcW(hwnd, msg, wp, lp); }
            let s = &mut *sp;
            let mx = (lp & 0xFFFF) as i16 as i32;
            let my = ((lp >> 16) & 0xFFFF) as i16 as i32;

            if s.pressed_btn == Some(BtnType::Close) {
                s.pressed_btn = None;
                let close_r = close_btn_rect(WIN_W);
                if in_rect(mx, my, &close_r) {
                    DestroyWindow(hwnd);
                    return 0;
                }
                InvalidateRect(hwnd, ptr::null(), 0);
                return 0;
            }

            if s.pressed_btn == Some(BtnType::Minimize) {
                s.pressed_btn = None;
                let min_r = min_btn_rect(WIN_W);
                if in_rect(mx, my, &min_r) {
                    ShowWindow(hwnd, SW_MINIMIZE);
                    return 0;
                }
                InvalidateRect(hwnd, ptr::null(), 0);
                return 0;
            }

            s.pressed_btn = None;
            0
        }

        WM_KEYDOWN => {
            if sp.is_null() { return DefWindowProcW(hwnd, msg, wp, lp); }
            let s = &mut *sp;
            
            let ctrl = (GetKeyState(VK_CONTROL as i32) & 0x8000u16 as i16) != 0;
            let shift = (GetKeyState(VK_SHIFT as i32) & 0x8000u16 as i16) != 0;

            match wp {
                VK_LEFT => {
                    if shift {
                        s.buffer.move_cursor(-1, 0);
                    } else {
                        if s.buffer.has_selection() {
                            let range = s.buffer.get_selection_range().unwrap();
                            s.buffer.set_cursor(range.0);
                        } else {
                            s.buffer.move_cursor(-1, 0);
                        }
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_RIGHT => {
                    if shift {
                        s.buffer.move_cursor(1, 0);
                    } else {
                        if s.buffer.has_selection() {
                            let range = s.buffer.get_selection_range().unwrap();
                            s.buffer.set_cursor(range.1);
                        } else {
                            s.buffer.move_cursor(1, 0);
                        }
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_UP => {
                    s.buffer.move_cursor(0, -1);
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_DOWN => {
                    s.buffer.move_cursor(0, 1);
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_HOME => {
                    if ctrl {
                        s.buffer.move_to_doc_boundary(true);
                    } else {
                        s.buffer.move_to_line_boundary(true);
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_END => {
                    if ctrl {
                        s.buffer.move_to_doc_boundary(false);
                    } else {
                        s.buffer.move_to_line_boundary(false);
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_PRIOR => {
                    s.buffer.move_page(s.visible_lines, true);
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_NEXT => {
                    s.buffer.move_page(s.visible_lines, false);
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_BACK => {
                    if s.buffer.has_selection() {
                        s.buffer.delete_selection();
                    } else {
                        s.buffer.backspace();
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_DELETE => {
                    if s.buffer.has_selection() {
                        s.buffer.delete_selection();
                    } else {
                        s.buffer.delete();
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_RETURN => {
                    s.buffer.insert_newline();
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_C if ctrl => {
                    if let Some(text) = s.buffer.get_selected_text() {
                        copy_to_clipboard(hwnd, &text);
                    } else {
                        let line = s.buffer.cursor_pos().line;
                        let line_text = s.buffer.lines[line].clone();
                        copy_to_clipboard(hwnd, &line_text);
                    }
                    0
                }
                VK_X if ctrl => {
                    if let Some(text) = s.buffer.get_selected_text() {
                        copy_to_clipboard(hwnd, &text);
                        s.buffer.delete_selection();
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_V if ctrl => {
                    if let Some(text) = paste_from_clipboard() {
                        s.buffer.replace_selection(&text);
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_A if ctrl => {
                    s.buffer.select_all();
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_S if ctrl => {
                    let path = match &s.file_path {
                        Some(p) => p.clone(),
                        None => {
                            if let Some(p) = show_save_dialog(hwnd) {
                                p
                            } else {
                                return 0;
                            }
                        }
                    };
                    if save_file(&path, &s.buffer.get_text()).is_ok() {
                        s.file_path = Some(path);
                        s.buffer.set_modified(false);
                    }
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_O if ctrl => {
                    if let Some(path) = show_open_dialog(hwnd) {
                        if let Ok(content) = load_file(&path) {
                            s.buffer.set_text(&content);
                            s.file_path = Some(path);
                        }
                    }
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                    0
                }
                VK_ESCAPE => {
                    DestroyWindow(hwnd);
                    0
                }
                _ => DefWindowProcW(hwnd, msg, wp, lp),
            }
        }

        WM_CHAR => {
            if sp.is_null() { return DefWindowProcW(hwnd, msg, wp, lp); }
            let s = &mut *sp;
            
            let ctrl = (GetKeyState(VK_CONTROL as i32) & 0x8000u16 as i16) != 0;
            if ctrl { return 0; }

            if let Some(ch) = char::from_u32(wp as u32) {
                if ch >= ' ' || ch == '\t' {
                    s.buffer.insert_char(ch);
                    s.ensure_cursor_visible(WIN_H);
                    InvalidateRect(hwnd, ptr::null(), 0);
                }
            }
            0
        }

        WM_DESTROY => {
            if !sp.is_null() {
                (*sp).fonts.free();
                let _ = Box::from_raw(sp);
            }
            PostQuitMessage(0);
            0
        }

        _ => DefWindowProcW(hwnd, msg, wp, lp),
    }
}

extern "system" {
    fn SetTimer(hwnd: HWND, id_event: usize, u_elapse: u32, lp_timer_func: *mut c_void) -> usize;
    fn KillTimer(hwnd: HWND, id_event: usize) -> BOOL;
}

// ── Entry Point ──────────────────────────────────────────────────
fn main() {
    unsafe {
        let hinstance = GetModuleHandleW(ptr::null());
        let class_name = to_wstring("NotepadNG");
        let title = to_wstring("Notepad-NG");

        let state = Box::new(AppState::new());
        let sp = Box::into_raw(state);

        let wc = WNDCLASSEXW {
            cb_size: mem::size_of::<WNDCLASSEXW>() as UINT,
            style: CS_HREDRAW | CS_VREDRAW,
            lpfn_wnd_proc: Some(wnd_proc),
            cb_cls_extra: 0,
            cb_wnd_extra: 0,
            h_instance: hinstance,
            h_icon: ptr::null_mut(),
            h_cursor: LoadCursorW(ptr::null_mut(), IDC_ARROW as *const u16),
            hbr_background: ptr::null_mut(),
            lpsz_menu_name: ptr::null(),
            lpsz_class_name: class_name.as_ptr(),
            h_icon_sm: ptr::null_mut(),
        };
        RegisterClassExW(&wc);

        let sw = GetSystemMetrics(0);
        let sh = GetSystemMetrics(1);

        let hwnd = CreateWindowExW(
            0,
            class_name.as_ptr(),
            title.as_ptr(),
            WS_POPUP | WS_CLIPCHILDREN,
            (sw - WIN_W) / 2,
            (sh - WIN_H) / 2,
            WIN_W,
            WIN_H,
            ptr::null_mut(),
            ptr::null_mut(),
            hinstance,
            ptr::null_mut(),
        );

        SetWindowLongPtrW(hwnd, GWLP_USERDATA, sp as isize);
        (*sp).fonts = Fonts::load();

        let dc = GetDC(hwnd);
        let mut size: SIZE = mem::zeroed();
        let test_str = to_wstring("Test");
        GetTextExtentPoint32W(dc, test_str.as_ptr(), 4, &mut size);
        ReleaseDC(hwnd, dc);
        (*sp).line_height = size.cy + 2;

        ShowWindow(hwnd, SW_SHOW);
        UpdateWindow(hwnd);

        let mut msg: MSG = mem::zeroed();
        while GetMessageW(&mut msg, ptr::null_mut(), 0, 0) > 0 {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    }
}
