// ── WinAPI FFI Declarations ──────────────────────────────────────
// Общие объявления WinAPI для всех модулей блокнота
// Только необходимое, без лишних зависимостей

#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(dead_code)]

use std::ffi::c_void;

// ── Basic Types ───────────────────────────────────────────────────
pub type HWND      = *mut c_void;
pub type HINSTANCE = *mut c_void;
pub type HMENU     = *mut c_void;
pub type HDC       = *mut c_void;
pub type HBRUSH    = *mut c_void;
pub type HFONT     = *mut c_void;
pub type HGDIOBJ   = *mut c_void;
pub type HPEN      = *mut c_void;
pub type HICON     = *mut c_void;
pub type WPARAM    = usize;
pub type LPARAM    = isize;
pub type LRESULT   = isize;
pub type BOOL      = i32;
pub type DWORD     = u32;
pub type UINT      = u32;
pub type LONG      = i32;
pub type ATOM      = u16;
pub type COLORREF  = u32;
pub type WORD      = u16;

// ── Window Styles ─────────────────────────────────────────────────
pub const WS_POPUP:        DWORD = 0x80000000;
pub const WS_CLIPCHILDREN: DWORD = 0x02000000;
pub const WS_CHILD:        DWORD = 0x40000000;
pub const WS_VISIBLE:      DWORD = 0x10000000;
pub const WS_OVERLAPPEDWINDOW: DWORD = 0x00CF0000;
pub const ES_MULTILINE:    DWORD = 0x0004;
pub const ES_WANTRETURN:   DWORD = 0x1000;
pub const ES_AUTOVSCROLL:  DWORD = 0x0040;
pub const ES_AUTOHSCROLL:  DWORD = 0x0080;
pub const ES_NOHIDESEL:    DWORD = 0x0008;

// ── Messages ──────────────────────────────────────────────────────
pub const WM_DESTROY:     UINT = 0x0002;
pub const WM_PAINT:       UINT = 0x000F;
pub const WM_ERASEBKGND:  UINT = 0x0014;
pub const WM_LBUTTONDOWN: UINT = 0x0201;
pub const WM_LBUTTONUP:   UINT = 0x0202;
pub const WM_MOUSEMOVE:   UINT = 0x0200;
pub const WM_MOUSELEAVE:  UINT = 0x02A3;
pub const WM_KEYDOWN:     UINT = 0x0100;
pub const WM_KEYUP:       UINT = 0x0101;
pub const WM_CHAR:        UINT = 0x0102;
pub const WM_CREATE:      UINT = 0x0001;
pub const WM_NCHITTEST:   UINT = 0x0084;
pub const WM_SYSCOMMAND:  UINT = 0x0112;
pub const WM_SETTEXT:     UINT = 0x000C;
pub const WM_GETTEXT:     UINT = 0x000D;
pub const WM_GETTEXTLENGTH:UINT= 0x000E;
pub const WM_SIZE:        UINT = 0x0005;
pub const WM_TIMER:       UINT = 0x0113;
pub const WM_SETFOCUS:    UINT = 0x0007;
pub const WM_KILLFOCUS:   UINT = 0x0008;
pub const WM_VSCROLL:     UINT = 0x0115;
pub const WM_HSCROLL:     UINT = 0x0114;

pub const WM_SETICON:     UINT = 0x0080;
pub const ICON_SMALL:     WPARAM = 0;
pub const ICON_BIG:       WPARAM = 1;
pub const IMAGE_ICON:     UINT   = 1;
pub const LR_LOADFROMFILE:UINT   = 0x0010;
pub const LR_DEFAULTSIZE: UINT   = 0x0040;

pub const SC_MINIMIZE:  WPARAM = 0xF020;

pub const HTCAPTION:  LRESULT = 2;
pub const HTCLIENT:   LRESULT = 1;

pub const SW_SHOW:    i32   = 5;
pub const SW_MINIMIZE: i32 = 6;
pub const GWLP_USERDATA: i32 = -21;

pub const IDC_ARROW:  usize = 32512;

pub const DT_LEFT:         UINT = 0x00000000;
pub const DT_CENTER:       UINT = 0x00000001;
pub const DT_RIGHT:        UINT = 0x00000002;
pub const DT_TOP:          UINT = 0x00000000;
pub const DT_VCENTER:      UINT = 0x00000004;
pub const DT_SINGLELINE:   UINT = 0x00000020;
pub const DT_END_ELLIPSIS: UINT = 0x00008000;
pub const DT_WORD_ELLIPSIS:UINT = 0x00040000;
pub const DT_NOCLIP:       UINT = 0x00000100;
pub const DT_CALCRECT:     UINT = 0x00000400;

pub const FW_NORMAL: i32 = 400;
pub const ANSI_CHARSET:        u8 = 0;
pub const OUT_TT_PRECIS:       u8 = 4;
pub const CLIP_DEFAULT_PRECIS: u8 = 0;
pub const CLEARTYPE_QUALITY:   u8 = 5;
pub const FF_SWISS:      u8 = 0x20;
pub const VARIABLE_PITCH: u8 = 2;

pub const CS_HREDRAW: DWORD = 0x0002;
pub const CS_VREDRAW: DWORD = 0x0001;

pub const VK_RETURN:  usize = 0x0D;
pub const VK_ESCAPE:  usize = 0x1B;
pub const VK_BACK:    usize = 0x08;
pub const VK_DELETE:  usize = 0x2E;
pub const VK_CONTROL: usize = 0x11;
pub const VK_SHIFT:   usize = 0x10;
pub const VK_LEFT:    usize = 0x25;
pub const VK_UP:      usize = 0x26;
pub const VK_RIGHT:   usize = 0x27;
pub const VK_DOWN:    usize = 0x28;
pub const VK_HOME:    usize = 0x24;
pub const VK_END:     usize = 0x23;
pub const VK_PRIOR:   usize = 0x21; // Page Up
pub const VK_NEXT:    usize = 0x22; // Page Down
pub const VK_C:       usize = 0x43;
pub const VK_V:       usize = 0x56;
pub const VK_A:       usize = 0x41;
pub const VK_S:       usize = 0x53;
pub const VK_O:       usize = 0x4F;
pub const VK_F:       usize = 0x46;

pub const CF_UNICODETEXT: UINT = 13;
pub const GMEM_MOVEABLE:  UINT = 0x0002;
pub const SRCCOPY:        DWORD = 0x00CC0020;
pub const TME_LEAVE:      DWORD = 0x00000002;

pub const EM_GETSEL:      UINT = 0x00B0;
pub const EM_SETSEL:      UINT = 0x00B1;
pub const EM_REPLACESEL:  UINT = 0x00C2;
pub const EM_GETLINECOUNT:UINT = 0x00BA;
pub const EM_LINEINDEX:   UINT = 0x00BB;
pub const EM_LINELENGTH:  UINT = 0x00C1;
pub const EM_SCROLLCARET: UINT = 0x00B7;
pub const EM_SETTABSTOPS: UINT = 0x00CB;

pub const SB_HORZ: UINT = 0;
pub const SB_VERT: UINT = 1;
pub const SB_CTL:  UINT = 2;
pub const SB_BOTH: UINT = 3;

pub const SW_HIDE: i32 = 0;

pub const WHITESPACE_COLOR: COLORREF = 0x001E1E1E;
pub const BG_COLOR:         COLORREF = 0x001E1E1E;
pub const PANEL_COLOR:      COLORREF = 0x00222222;
pub const TEXT_WHITE:       COLORREF = 0x00FFFFFF;
pub const TEXT_GRAY:        COLORREF = 0x00AAAAAA;
pub const SEPARATOR:        COLORREF = 0x003A3A3A;
pub const CURSOR_COLOR:     COLORREF = 0x00FFAA00;
pub const SELECTION_COLOR:  COLORREF = 0x00444466;
pub const TITLE_BG:         COLORREF = 0x00181818;
pub const STATUS_BG:        COLORREF = 0x00252525;

// ── Structures ────────────────────────────────────────────────────
#[repr(C)]
pub struct WNDCLASSEXW {
    pub cb_size: UINT,
    pub style: UINT,
    pub lpfn_wnd_proc: Option<unsafe extern "system" fn(HWND, UINT, WPARAM, LPARAM) -> LRESULT>,
    pub cb_cls_extra: i32,
    pub cb_wnd_extra: i32,
    pub h_instance: HINSTANCE,
    pub h_icon: *mut c_void,
    pub h_cursor: *mut c_void,
    pub hbr_background: HBRUSH,
    pub lpsz_menu_name: *const u16,
    pub lpsz_class_name: *const u16,
    pub h_icon_sm: *mut c_void,
}

#[repr(C)]
pub struct MSG {
    pub hwnd: HWND,
    pub message: UINT,
    pub w_param: WPARAM,
    pub l_param: LPARAM,
    pub time: DWORD,
    pub pt_x: LONG,
    pub pt_y: LONG,
}

#[repr(C)]
pub struct PAINTSTRUCT {
    pub hdc: HDC,
    pub f_erase: BOOL,
    pub rc_paint: RECT,
    pub f_restore: BOOL,
    pub f_inc_update: BOOL,
    pub rgb_reserved: [u8; 32],
}

#[repr(C)]
#[derive(Clone, Copy, Default)]
pub struct RECT {
    pub left: LONG,
    pub top: LONG,
    pub right: LONG,
    pub bottom: LONG,
}

#[repr(C)]
#[derive(Clone, Copy, Default)]
pub struct POINT {
    pub x: LONG,
    pub y: LONG,
}

#[repr(C)]
pub struct SIZE {
    pub cx: LONG,
    pub cy: LONG,
}

#[repr(C)]
pub struct TRACKMOUSEEVENT {
    pub cb_size: DWORD,
    pub dw_flags: DWORD,
    pub hwnd_track: HWND,
    pub dw_hover_time: DWORD,
}

#[repr(C)]
pub struct MINMAXINFO {
    pub pt_reserved: POINT,
    pub pt_max_size: POINT,
    pub pt_max_position: POINT,
    pub pt_min_track_size: POINT,
    pub pt_max_track_size: POINT,
}

// ── Win32 Imports ─────────────────────────────────────────────────
#[link(name = "user32")]
extern "system" {
    pub fn RegisterClassExW(lpwcx: *const WNDCLASSEXW) -> ATOM;
    pub fn CreateWindowExW(
        dw_ex_style: DWORD,
        lp_class_name: *const u16,
        lp_window_name: *const u16,
        dw_style: DWORD,
        x: i32, y: i32,
        n_width: i32, n_height: i32,
        h_wnd_parent: HWND,
        h_menu: HMENU,
        h_instance: HINSTANCE,
        lp_param: *mut c_void
    ) -> HWND;
    pub fn ShowWindow(h_wnd: HWND, n_cmd_show: i32) -> BOOL;
    pub fn UpdateWindow(h_wnd: HWND) -> BOOL;
    pub fn GetMessageW(lp_msg: *mut MSG, h_wnd: HWND, w_msg_filter_min: UINT, w_msg_filter_max: UINT) -> BOOL;
    pub fn TranslateMessage(lp_msg: *const MSG) -> BOOL;
    pub fn DispatchMessageW(lp_msg: *const MSG) -> LRESULT;
    pub fn DefWindowProcW(h_wnd: HWND, msg: UINT, w_param: WPARAM, l_param: LPARAM) -> LRESULT;
    pub fn PostQuitMessage(n_exit_code: i32);
    pub fn BeginPaint(h_wnd: HWND, lp_paint: *mut PAINTSTRUCT) -> HDC;
    pub fn EndPaint(h_wnd: HWND, lp_paint: *const PAINTSTRUCT) -> BOOL;
    pub fn InvalidateRect(h_wnd: HWND, lp_rect: *const RECT, b_erase: BOOL) -> BOOL;
    pub fn GetClientRect(h_wnd: HWND, lp_rect: *mut RECT) -> BOOL;
    pub fn GetSystemMetrics(n_index: i32) -> i32;
    pub fn LoadCursorW(h_instance: HINSTANCE, lp_cursor_name: *const u16) -> *mut c_void;
    pub fn SetFocus(h_wnd: HWND) -> HWND;
    pub fn OpenClipboard(h_wnd_new_owner: HWND) -> BOOL;
    pub fn EmptyClipboard() -> BOOL;
    pub fn SetClipboardData(u_format: UINT, h_mem: *mut c_void) -> *mut c_void;
    pub fn GetClipboardData(u_format: UINT) -> *mut c_void;
    pub fn CloseClipboard() -> BOOL;
    pub fn IsClipboardFormatAvailable(format: UINT) -> BOOL;
    pub fn GetWindowLongPtrW(h_wnd: HWND, n_index: i32) -> isize;
    pub fn SetWindowLongPtrW(h_wnd: HWND, n_index: i32, dw_new_long: isize) -> isize;
    pub fn TrackMouseEvent(lp_event_track: *mut TRACKMOUSEEVENT) -> BOOL;
    pub fn GetKeyState(n_virt_key: i32) -> i16;
    pub fn GetCursorPos(lp_point: *mut POINT) -> BOOL;
    pub fn ScreenToClient(h_wnd: HWND, lp_point: *mut POINT) -> BOOL;
    pub fn DestroyWindow(h_wnd: HWND) -> BOOL;
    pub fn LoadImageW(
        hinst: HINSTANCE,
        name: *const u16,
        typ: UINT,
        cx: i32,
        cy: i32,
        fuload: UINT
    ) -> *mut c_void;
    pub fn SendMessageW(h_wnd: HWND, msg: UINT, w_param: WPARAM, l_param: LPARAM) -> LRESULT;
    pub fn PostMessageW(h_wnd: HWND, msg: UINT, w_param: WPARAM, l_param: LPARAM) -> BOOL;
    pub fn GetWindowTextW(h_wnd: HWND, lp_string: *mut u16, n_max_count: i32) -> i32;
    pub fn SetWindowTextW(h_wnd: HWND, lp_string: *const u16) -> BOOL;
    pub fn MessageBoxW(h_wnd: HWND, lp_text: *const u16, lp_caption: *const u16, u_type: UINT) -> i32;
    pub fn GetDC(h_wnd: HWND) -> HDC;
    pub fn ReleaseDC(h_wnd: HWND, hdc: HDC) -> i32;
    pub fn MapWindowPoints(h_wnd_from: HWND, h_wnd_to: HWND, lp_points: *mut POINT, c_points: UINT) -> i32;
    pub fn GetScrollInfo(h_wnd: HWND, n_bar: i32, lpsi: *mut SCROLLINFO) -> BOOL;
    pub fn SetScrollInfo(h_wnd: HWND, n_bar: i32, lpsi: *const SCROLLINFO, b_redraw: BOOL) -> i32;
    pub fn ShowScrollBar(h_wnd: HWND, w_bar: UINT, b_show: BOOL) -> BOOL;
    pub fn EnableScrollBar(h_wnd: HWND, w_arrows: UINT, w_flags: UINT) -> BOOL;
    pub fn CreateWindowExW as CreateWindowExW;
}

#[link(name = "gdi32")]
extern "system" {
    pub fn CreateSolidBrush(color: COLORREF) -> HBRUSH;
    pub fn CreatePen(fn_pen_style: i32, n_width: i32, cr_color: COLORREF) -> HPEN;
    pub fn SelectObject(hdc: HDC, h: HGDIOBJ) -> HGDIOBJ;
    pub fn DeleteObject(h: HGDIOBJ) -> BOOL;
    pub fn SetTextColor(hdc: HDC, color: COLORREF) -> COLORREF;
    pub fn SetBkMode(hdc: HDC, mode: i32) -> i32;
    pub fn GetStockObject(i: i32) -> HGDIOBJ;
    pub fn FillRect(hdc: HDC, lprc: *const RECT, hbr: HBRUSH) -> i32;
    pub fn DrawTextW(
        hdc: HDC,
        lp_str: *const u16,
        n_count: i32,
        lp_rect: *mut RECT,
        u_format: UINT
    ) -> i32;
    pub fn CreateFontW(
        h: i32, w: i32, e: i32, o: i32,
        weight: i32,
        italic: DWORD,
        underline: DWORD,
        strikeout: DWORD,
        charset: DWORD,
        out_prec: DWORD,
        clip_prec: DWORD,
        quality: DWORD,
        pitch_family: DWORD,
        face: *const u16
    ) -> HFONT;
    pub fn RoundRect(hdc: HDC, left: i32, top: i32, right: i32, bottom: i32, w: i32, h: i32) -> BOOL;
    pub fn MoveToEx(hdc: HDC, x: i32, y: i32, lp_point: *mut POINT) -> BOOL;
    pub fn LineTo(hdc: HDC, x: i32, y: i32) -> BOOL;
    pub fn CreateCompatibleDC(hdc: HDC) -> HDC;
    pub fn CreateCompatibleBitmap(hdc: HDC, cx: i32, cy: i32) -> *mut c_void;
    pub fn BitBlt(
        hdc_dest: HDC,
        x: i32, y: i32,
        cx: i32, cy: i32,
        hdc_src: HDC,
        x1: i32, y1: i32,
        rop: DWORD
    ) -> BOOL;
    pub fn DeleteDC(hdc: HDC) -> BOOL;
    pub fn GetTextExtentPoint32W(
        hdc: HDC,
        lp_str: *const u16,
        c: i32,
        lp_size: *mut SIZE
    ) -> BOOL;
    pub fn GetCharWidth32W(
        hdc: HDC,
        i_first: UINT,
        i_last: UINT,
        lp_buffer: *mut i32
    ) -> BOOL;
}

#[link(name = "kernel32")]
extern "system" {
    pub fn GetModuleHandleW(lp_module_name: *const u16) -> HINSTANCE;
    pub fn GlobalAlloc(u_flags: UINT, dw_bytes: usize) -> *mut c_void;
    pub fn GlobalLock(h_mem: *mut c_void) -> *mut c_void;
    pub fn GlobalUnlock(h_mem: *mut c_void) -> BOOL;
    pub fn lstrlenW(lp_string: *const u16) -> i32;
    pub fn GetFullPathNameW(
        lp_file_name: *const u16,
        n_buffer_length: DWORD,
        lp_buffer: *mut u16,
        lp_file_part: *mut *mut u16
    ) -> DWORD;
    pub fn GetCurrentDirectoryW(n_buffer_length: DWORD, lp_buffer: *mut u16) -> DWORD;
    pub fn SetCurrentDirectoryW(lp_path_name: *const u16) -> BOOL;
}

#[link(name = "comdlg32")]
extern "system" {
    pub fn GetOpenFileNameW(lponf: *mut OPENFILENAMEW) -> BOOL;
    pub fn GetSaveFileNameW(lponf: *mut OPENFILENAMEW) -> BOOL;
}

// ── Common Dialog Structures ─────────────────────────────────────
#[repr(C)]
pub struct OPENFILENAMEW {
    pub lStructSize: DWORD,
    pub hwndOwner: HWND,
    pub hInstance: HINSTANCE,
    pub lpstrFilter: *const u16,
    pub lpstrCustomFilter: *mut u16,
    pub nMaxCustFilter: DWORD,
    pub nFilterIndex: DWORD,
    pub lpstrFile: *mut u16,
    pub nMaxFile: DWORD,
    pub lpstrFileTitle: *mut u16,
    pub nMaxFileTitle: DWORD,
    pub lpstrInitialDir: *const u16,
    pub lpstrTitle: *const u16,
    pub Flags: DWORD,
    pub nFileOffset: WORD,
    pub nFileExtension: WORD,
    pub lpstrDefExt: *const u16,
    pub lCustData: LPARAM,
    pub lpfnHook: Option<unsafe extern "system" fn(HWND, UINT, WPARAM, LPARAM) -> UINT>,
    pub lpTemplateName: *const u16,
    pub pvReserved: *mut c_void,
    pub dwReserved: DWORD,
    pub FlagsEx: DWORD,
}

pub const OFN_OVERWRITEPROMPT: DWORD = 0x00000002;
pub const OFN_PATHMUSTEXIST: DWORD = 0x00000800;
pub const OFN_FILEMUSTEXIST: DWORD = 0x00001000;
pub const OFN_EXPLORER: DWORD = 0x00080000;
pub const OFN_LONGNAMES: DWORD = 0x00200000;
pub const OFN_NOCHANGEDIR: DWORD = 0x00000008;

#[repr(C)]
pub struct SCROLLINFO {
    pub cbSize: UINT,
    pub fMask: UINT,
    pub nMin: i32,
    pub nMax: i32,
    pub nPage: UINT,
    pub nPos: i32,
    pub nTrackPos: i32,
}

pub const SIF_RANGE: UINT = 0x0001;
pub const SIF_PAGE: UINT = 0x0002;
pub const SIF_POS: UINT = 0x0004;
pub const SIF_DISABLENOSCROLL: UINT = 0x0008;
pub const SIF_ALL: UINT = SIF_RANGE | SIF_PAGE | SIF_POS;

// ── Helper Functions ──────────────────────────────────────────────
pub fn to_wstring(s: &str) -> Vec<u16> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use std::iter::once;
    OsStr::new(s).encode_wide().chain(once(0)).collect()
}

pub unsafe fn wstring_to_string(ptr: *const u16) -> String {
    if ptr.is_null() {
        return String::new();
    }
    let len = lstrlenW(ptr) as usize;
    String::from_utf16_lossy(std::slice::from_raw_parts(ptr, len))
}
