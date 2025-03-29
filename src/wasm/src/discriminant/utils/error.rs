use std::collections::HashMap;

// Tipe data untuk menghimpun error dari berbagai fungsi
pub type AnalysisResult<T> = Result<T, String>;

// Struktur data untuk error collector
#[derive(Debug, Clone, Default)]
pub struct ErrorCollector {
    errors: HashMap<String, Vec<String>>,
}

impl ErrorCollector {
    // Menambahkan error baru ke collector
    pub fn add_error(&mut self, context: &str, message: &str) {
        let entry = self.errors.entry(context.to_string()).or_insert_with(Vec::new);
        entry.push(message.to_string());
    }

    // Mengecek apakah ada error
    pub fn has_errors(&self) -> bool {
        !self.errors.is_empty()
    }

    // Mendapatkan seluruh error sebagai formatted string
    pub fn get_error_summary(&self) -> String {
        if !self.has_errors() {
            return "No errors occurred.".to_string();
        }

        let mut summary = String::from("Error Summary:\n");
        for (context, errors) in &self.errors {
            summary.push_str(&format!("Context: {}\n", context));
            for (i, error) in errors.iter().enumerate() {
                summary.push_str(&format!("  {}. {}\n", i + 1, error));
            }
        }

        summary
    }

    // Reset error collector
    pub fn clear(&mut self) {
        self.errors.clear();
    }
}
