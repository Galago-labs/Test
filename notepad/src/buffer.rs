// ── Text Buffer Module ────────────────────────────────────────────
// Хранение и манипуляция текстом. Независим от UI.
// Логическая структура: строки, курсор, выделение.

use std::cmp::{min, max};

/// Позиция курсора: строка и колонка (в символах)
#[derive(Clone, Copy, Default, PartialEq)]
pub struct CursorPos {
    pub line: usize,
    pub col: usize,
}

/// Текстовый буфер с поддержкой строк, курсора и выделения
pub struct TextBuffer {
    /// Текст как вектор строк (без символов новой строки)
    lines: Vec<String>,
    /// Позиция курсора
    cursor: CursorPos,
    /// Выделение: начало и конец (если Some)
    selection: Option<(CursorPos, CursorPos)>,
    /// Флаг изменения документа
    modified: bool,
    /// Максимальная длина строки для скроллинга
    max_line_width: usize,
}

impl TextBuffer {
    /// Создать новый пустой буфер
    pub fn new() -> Self {
        TextBuffer {
            lines: vec![String::new()],
            cursor: CursorPos::default(),
            selection: None,
            modified: false,
            max_line_width: 0,
        }
    }

    /// Получить содержимое как одну строку (с \n)
    pub fn get_text(&self) -> String {
        self.lines.join("\n")
    }

    /// Установить содержимое из строки
    pub fn set_text(&mut self, text: &str) {
        self.lines.clear();
        for line in text.split('\n') {
            self.lines.push(line.to_string());
        }
        if self.lines.is_empty() {
            self.lines.push(String::new());
        }
        self.cursor = CursorPos { line: 0, col: 0 };
        self.selection = None;
        self.modified = false;
        self.update_max_width();
    }

    /// Получить количество строк
    pub fn line_count(&self) -> usize {
        self.lines.len()
    }

    /// Получить длину указанной строки (в символах)
    pub fn line_length(&self, line: usize) -> usize {
        self.lines.get(line).map(|s| s.chars().count()).unwrap_or(0)
    }

    /// Получить общую длину текста (в символах)
    pub fn char_count(&self) -> usize {
        let chars: usize = self.lines.iter().map(|s| s.chars().count()).sum();
        let newlines = if self.lines.len() > 1 { self.lines.len() - 1 } else { 0 };
        chars + newlines
    }

    /// Получить текущую позицию курсора
    pub fn cursor_pos(&self) -> CursorPos {
        self.cursor
    }

    /// Установить позицию курсора (с проверкой границ)
    pub fn set_cursor(&mut self, pos: CursorPos) {
        let line = min(pos.line, self.lines.len().saturating_sub(1));
        let col = min(pos.col, self.line_length(line));
        self.cursor = CursorPos { line, col };
        self.clamp_selection();
    }

    /// Переместить курсор на одну позицию
    pub fn move_cursor(&mut self, dx: isize, dy: isize) {
        let mut new_line = self.cursor.line as isize + dy;
        let mut new_col = self.cursor.col as isize + dx;

        // Ограничение по строкам
        new_line = max(0, min(new_line, self.lines.len() as isize - 1));

        // Ограничение по колонкам в новой строке
        let line_len = self.line_length(new_line as usize) as isize;
        new_col = max(0, min(new_col, line_len));

        self.cursor = CursorPos {
            line: new_line as usize,
            col: new_col as usize,
        };
        self.clamp_selection();
    }

    /// Переместить курсор в начало/конец строки
    pub fn move_to_line_boundary(&mut self, to_start: bool) {
        self.cursor.col = if to_start { 0 } else { self.line_length(self.cursor.line) };
        self.clamp_selection();
    }

    /// Переместить курсор в начало/конец документа
    pub fn move_to_doc_boundary(&mut self, to_start: bool) {
        if to_start {
            self.cursor = CursorPos { line: 0, col: 0 };
        } else {
            let last_line = self.lines.len().saturating_sub(1);
            self.cursor = CursorPos {
                line: last_line,
                col: self.line_length(last_line),
            };
        }
        self.clamp_selection();
    }

    /// Переместить курсор на страницу вверх/вниз
    pub fn move_page(&mut self, lines_per_page: usize, up: bool) {
        let delta = if up { -(lines_per_page as isize) } else { lines_per_page as isize };
        self.move_cursor(0, delta);
    }

    /// Вставить символ в текущую позицию
    pub fn insert_char(&mut self, ch: char) {
        self.clear_selection();

        let line_str = &mut self.lines[self.cursor.line];
        let byte_idx = self.char_to_byte_idx(self.cursor.line, self.cursor.col);
        line_str.insert(byte_idx, ch);

        self.cursor.col += 1;
        self.modified = true;
        self.update_max_width();
    }

    /// Вставить строку в текущую позицию
    pub fn insert_str(&mut self, s: &str) {
        self.clear_selection();

        for ch in s.chars() {
            if ch == '\n' {
                self.insert_newline();
            } else {
                self.insert_char(ch);
            }
        }
    }

    /// Вставить новую строку (Enter)
    pub fn insert_newline(&mut self) {
        self.clear_selection();

        let line_str = self.lines[self.cursor.line].clone();
        let byte_idx = self.char_to_byte_idx(self.cursor.line, self.cursor.col);

        // Разделить строку на две
        let first_part = line_str[..byte_idx].to_string();
        let second_part = line_str[byte_idx..].to_string();

        self.lines[self.cursor.line] = first_part;
        self.lines.insert(self.cursor.line + 1, second_part);

        self.cursor.line += 1;
        self.cursor.col = 0;
        self.modified = true;
        self.update_max_width();
    }

    /// Удалить символ перед курсором (Backspace)
    pub fn backspace(&mut self) -> bool {
        self.clear_selection();

        if self.cursor.col > 0 {
            // Удалить символ в текущей строке
            let line_str = &mut self.lines[self.cursor.line];
            let byte_idx = self.char_to_byte_idx(self.cursor.line, self.cursor.col);
            if byte_idx > 0 {
                let prev_ch_len = line_str[..byte_idx].chars().last().map(|c| c.len_utf8()).unwrap_or(1);
                line_str.replace_range((byte_idx - prev_ch_len)..byte_idx, "");
                self.cursor.col -= 1;
                self.modified = true;
                self.update_max_width();
                return true;
            }
        } else if self.cursor.line > 0 {
            // Объединить с предыдущей строкой
            let prev_line_len = self.line_length(self.cursor.line - 1);
            let current_line = self.lines.remove(self.cursor.line);
            self.lines[self.cursor.line - 1].push_str(&current_line);
            self.cursor.line -= 1;
            self.cursor.col = prev_line_len;
            self.modified = true;
            self.update_max_width();
            return true;
        }
        false
    }

    /// Удалить символ после курсора (Delete)
    pub fn delete(&mut self) -> bool {
        self.clear_selection();

        let line_len = self.line_length(self.cursor.line);
        if self.cursor.col < line_len {
            // Удалить символ в текущей строке
            let line_str = &mut self.lines[self.cursor.line];
            let byte_idx = self.char_to_byte_idx(self.cursor.line, self.cursor.col);
            let ch_len = line_str[byte_idx..].chars().next().map(|c| c.len_utf8()).unwrap_or(1);
            line_str.replace_range(byte_idx..(byte_idx + ch_len), "");
            self.modified = true;
            self.update_max_width();
            return true;
        } else if self.cursor.line < self.lines.len() - 1 {
            // Объединить со следующей строкой
            let next_line = self.lines.remove(self.cursor.line + 1);
            self.lines[self.cursor.line].push_str(&next_line);
            self.modified = true;
            self.update_max_width();
            return true;
        }
        false
    }

    /// Начать выделение с текущей позиции курсора
    pub fn start_selection(&mut self) {
        self.selection = Some((self.cursor, self.cursor));
    }

    /// Обновить конец выделения (переместить курсор)
    pub fn extend_selection(&mut self, new_pos: CursorPos) {
        if self.selection.is_none() {
            self.start_selection();
        }
        self.set_cursor(new_pos);
    }

    /// Получить диапазон выделения (отсортированный)
    pub fn get_selection_range(&self) -> Option<(CursorPos, CursorPos)> {
        self.selection.and_then(|(start, end)| {
            if start.line < end.line || (start.line == end.line && start.col <= end.col) {
                Some((start, end))
            } else {
                Some((end, start))
            }
        })
    }

    /// Есть ли активное выделение
    pub fn has_selection(&self) -> bool {
        self.selection.is_some() && {
            let (start, end) = self.selection.unwrap();
            start != end
        }
    }

    /// Получить выделенный текст
    pub fn get_selected_text(&self) -> Option<String> {
        self.get_selection_range().map(|(start, end)| {
            if start.line == end.line {
                // Одна строка
                let line = &self.lines[start.line];
                let start_byte = self.char_to_byte_idx(start.line, start.col);
                let end_byte = self.char_to_byte_idx(end.line, end.col);
                line[start_byte..end_byte].to_string()
            } else {
                // Несколько строк
                let mut result = String::new();
                
                // Первая строка (частично)
                let first_line = &self.lines[start.line];
                let start_byte = self.char_to_byte_idx(start.line, start.col);
                result.push_str(&first_line[start_byte..]);
                result.push('\n');

                // Промежуточные строки (полностью)
                for i in (start.line + 1)..end.line {
                    result.push_str(&self.lines[i]);
                    result.push('\n');
                }

                // Последняя строка (частично)
                let last_line = &self.lines[end.line];
                let end_byte = self.char_to_byte_idx(end.line, end.col);
                result.push_str(&last_line[..end_byte]);

                result
            }
        })
    }

    /// Удалить выделенный текст
    pub fn delete_selection(&mut self) {
        if let Some((start, end)) = self.get_selection_range() {
            self.delete_range(start, end);
            self.selection = None;
        }
    }

    /// Заменить выделение на текст
    pub fn replace_selection(&mut self, text: &str) {
        if self.has_selection() {
            self.delete_selection();
        }
        self.insert_str(text);
    }

    /// Очистить выделение
    pub fn clear_selection(&mut self) {
        if self.has_selection() {
            self.delete_selection();
        }
        self.selection = None;
    }

    /// Выделить всё
    pub fn select_all(&mut self) {
        let start = CursorPos { line: 0, col: 0 };
        let end = CursorPos {
            line: self.lines.len().saturating_sub(1),
            col: self.line_length(self.lines.len().saturating_sub(1)),
        };
        self.selection = Some((start, end));
    }

    /// Проверить флаг изменений
    pub fn is_modified(&self) -> bool {
        self.modified
    }

    /// Сбросить флаг изменений
    pub fn set_modified(&mut self, modified: bool) {
        self.modified = modified;
    }

    /// Получить максимальную ширину строки
    pub fn max_line_width(&self) -> usize {
        self.max_line_width
    }

    // ── Private Helpers ───────────────────────────────────────────

    /// Преобразовать позицию в символах в байтовый индекс
    fn char_to_byte_idx(&self, line: usize, col: usize) -> usize {
        self.lines[line]
            .char_indices()
            .nth(col)
            .map(|(i, _)| i)
            .unwrap_or(self.lines[line].len())
    }

    /// Удалить диапазон текста
    fn delete_range(&mut self, start: CursorPos, end: CursorPos) {
        if start.line == end.line {
            // Одна строка
            let line_str = &mut self.lines[start.line];
            let start_byte = self.char_to_byte_idx(start.line, start.col);
            let end_byte = self.char_to_byte_idx(end.line, end.col);
            line_str.replace_range(start_byte..end_byte, "");
            self.cursor = start;
        } else {
            // Несколько строк
            let first_line = self.lines[start.line].clone();
            let last_line = self.lines[end.line].clone();
            
            let start_byte = self.char_to_byte_idx(start.line, start.col);
            let end_byte = self.char_to_byte_idx(end.line, end.col);

            let merged = format!("{}{}", &first_line[..start_byte], &last_line[end_byte..]);
            
            self.lines[start.line] = merged;
            self.lines.drain((start.line + 1)..=(end.line));
            
            self.cursor = start;
        }
        self.modified = true;
        self.update_max_width();
    }

    /// Обновить максимальную ширину строки
    fn update_max_width(&mut self) {
        self.max_line_width = self.lines.iter()
            .map(|s| s.chars().count())
            .max()
            .unwrap_or(0);
    }

    /// Ограничить выделение допустимыми границами
    fn clamp_selection(&mut self) {
        if let Some((start, end)) = self.selection {
            let clamped_start = self.clamp_cursor(start);
            let clamped_end = self.clamp_cursor(end);
            self.selection = Some((clamped_start, clamped_end));
        }
    }

    /// Ограничить позицию курсора допустимыми границами
    fn clamp_cursor(&self, pos: CursorPos) -> CursorPos {
        let line = min(pos.line, self.lines.len().saturating_sub(1));
        let col = min(pos.col, self.line_length(line));
        CursorPos { line, col }
    }
}

impl Default for TextBuffer {
    fn default() -> Self {
        Self::new()
    }
}
