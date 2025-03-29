# Rust Statistical Library dengan WASM Support

Proyek ini adalah implementasi library statistik menggunakan Rust dengan dukungan WebAssembly melalui wasm-bindgen, yang memungkinkan fungsi-fungsi statistik digunakan di browser atau aplikasi JavaScript.

## Struktur Proyek

```
src/
|   mod.rs                  # Root module, mengekspor semua komponen publik
|   
+---models/                 # Definisi struktur data
|       config.rs           # Konfigurasi untuk analisis statistik
|       data.rs             # Struktur data input
|       mod.rs              # Ekspor model
|       result.rs           # Struktur hasil analisis
|       
+---stats/                  # Implementasi algoritma statistik
|       core.rs             # Fungsi-fungsi statistik inti
|       mod.rs              # Ekspor fungsi statistik
|       
+---test/                   # Modul pengujian
|       sample.rs             # Data untuk pengujian
|       example.rs          # Contoh penggunaan dan test case
|       mod.rs              # Ekspor modul test
|       
+---utils/                  # Utilitas pendukung
|       converter.rs        # Konversi antara format (JSON, struct)
|       error.rs            # Penanganan error terstandarisasi
|       mod.rs              # Ekspor utilitas
|       
\---wasm/                   # Binding WebAssembly
        constructor.rs      # Constructor-based API untuk JavaScript
        function.rs         # Function-based API untuk JavaScript
        mod.rs              # Ekspor binding WASM
```

### Tabel File dan Fungsi Utama

| File                | Fungsi Utama                                              | Input                       | Output                      |
|---------------------|-----------------------------------------------------------|-----------------------------|-----------------------------|
| `mod.rs`            | Mengekspor semua modul publik untuk library               | -                           | Modul publik                |
| `models/mod.rs`     | Re-export semua struktur model                            | -                           | Tipe data publik            |
| `models/config.rs`  | Mendefinisikan struktur konfigurasi analisis              | -                           | Struktur `Config`           |
| `models/data.rs`    | Mendefinisikan struktur data input                        | -                           | Struktur `DataSet`          |
| `models/result.rs`  | Mendefinisikan struktur output hasil analisis             | -                           | Struktur `StatResult`       |
| `stats/mod.rs`      | Re-export fungsi statistik                                | -                           | Fungsi `analyze`            |
| `stats/core.rs`     | Implementasi algoritma statistik                          | `DataSet`, `Config`         | `StatResult`                |
| `utils/mod.rs`      | Re-export utilitas                                        | -                           | Fungsi utilitas publik      |
| `utils/converter.rs`| Konversi antara JSON dan struktur Rust                    | `&str`, `StatResult`        | `(DataSet, Config)`, `String` |
| `utils/error.rs`    | Definisi dan penanganan error                             | -                           | Enum `StatError`            |
| `wasm/mod.rs`       | Re-export binding WASM                                    | -                           | API WASM                    |
| `wasm/constructor.rs`| API berorientasi objek untuk JavaScript                   | `&str` (JSON)               | `String` (JSON)             |
| `wasm/function.rs`  | API fungsional untuk JavaScript                           | `&str` (JSON)               | `String` (JSON)             |
| `test/mod.rs`       | Re-export modul test                                      | -                           | -                           |
| `test/data.rs`      | Menyediakan data pengujian                                | -                           | `DataSet`, `Config`         |
| `test/example.rs`   | Test case dan contoh penggunaan                           | `DataSet`, `Config`         | Hasil test                  |


## Keunggulan Arsitektur

1. **Modularitas Tinggi**: Setiap komponen memiliki tanggung jawab spesifik dan terpisah
2. **Dukungan API Ganda**: Menawarkan pendekatan OO dan fungsional untuk fleksibilitas
3. **Error Handling Konsisten**: Pendekatan terstandarisasi untuk error di seluruh library
4. **Testability**: Struktur yang mudah diuji secara terpisah
5. **Maintainability**: Mudah dipelihara dan diperluas

## Keterkaitan Antar File

```
                          ┌────────────────────────┐
                          │        mod.rs          │
                          │  (Root module export)  │
                          └───────────┬────────────┘
                                      │
                 ┌───────────────┬────┴────┬────────────┬────────────┐
                 │               │         │            │            │
         ┌───────▼──────┐ ┌─────▼─────┐   ▼      ┌─────▼─────┐ ┌────▼─────┐
         │  models/     │ │  stats/   │   │      │  utils/   │ │  wasm/   │
         │  mod.rs      │ │  mod.rs   │   │      │  mod.rs   │ │  mod.rs  │
         └───────┬──────┘ └─────┬─────┘   │      └─────┬─────┘ └────┬─────┘
                 │              │         │            │            │
     ┌───────────┼──────────┐   │         │      ┌─────┴─────┐     │
     │           │          │   │         │      │           │     │
┌────▼───┐ ┌─────▼────┐ ┌──▼───┐ ┌────────▼─┐ ┌─▼────────┐ ┌─▼────────┐  ┌─────────────┐
│config.rs│ │data.rs   │ │result.rs│ │core.rs  │ │converter.rs│ │error.rs  │  │constructor.rs│
└────┬───┘ └─────┬────┘ └──┬───┘ └────────┬─┘ └─┬────────┘ └──────────┘  └──────┬──────┘
     │           │         │              │     │                               │
     │           │         │              │     │                               │
     └───────────┼─────────┼──────────────▼─────┼───────────────────────────┐  │
                 │         │      ┌──────────────────────────────────┐      │  │
                 │         │      │    Implementasi stats/core.rs    │      │  │
                 │         │      │    - Menerima DataSet & Config   │◄─────┘  │
                 │         │      │    - Menggunakan StatError       │         │
                 │         │      │    - Menghasilkan StatResult     │         │
                 │         │      └──────────────────────────────────┘         │
                 │         │                                                   │
                 │         │      ┌──────────────────────────────────┐         │
                 │         └─────►│    Implementasi wasm/*.rs        │◄────────┘
                 │                │    - Menerima JSON               │
                 │                │    - Memanggil converter.rs      │
                 │                │    - Memanggil core.rs           │
                 │                │    - Mengembalikan JSON Result   │
                 │                └──────────────────────────────────┘
                 │
                 │                ┌──────────────────────────────────┐
                 └───────────────►│    Implementasi utils/converter  │
                                  │    - Mengkonversi JSON<->Struct  │
                                  │    - Menggunakan model structs   │
                                  └──────────────────────────────────┘
```

### Aliran Data

1. **Entrypoint (wasm layer)**:
   - `wasm/constructor.rs` atau `wasm/function.rs` menerima input JSON dari JavaScript
   - Memanggil `utils/converter.rs` untuk mengkonversi JSON menjadi struct Rust

2. **Proses Utama**:
   - `stats/core.rs` menerima struktur `DataSet` dan `Config` dari wasm layer
   - Melakukan validasi dan proses analisis statistik
   - Menghasilkan `StatResult` yang berisi hasil analisis atau pesan error

3. **Output (wasm layer)**:
   - `utils/converter.rs` mengkonversi `StatResult` kembali ke JSON
   - `wasm/constructor.rs` atau `wasm/function.rs` mengembalikan JSON ke JavaScript

### Dependensi Antar Modul

| Modul       | Bergantung Pada                                |
|-------------|------------------------------------------------|
| `models/`   | Tidak bergantung pada modul lain               |
| `utils/`    | Bergantung pada `models/`                      |
| `stats/`    | Bergantung pada `models/` dan `utils/error.rs` |
| `wasm/`     | Bergantung pada semua modul lainnya            |
| `test/`     | Bergantung pada semua modul lainnya            |


## Penjelasan Komponen

### 1. Models

Modul ini berisi definisi struktur data yang digunakan dalam library.

#### `config.rs`

Mendefinisikan struktur konfigurasi untuk operasi statistik:

```rust
pub struct Config {
    pub method: String,           // Metode statistik ("mean", "median", dll)
    pub params: Vec<String>,      // Parameter opsional
    pub options: ConfigOptions,   // Opsi tambahan
}

pub struct ConfigOptions {
    pub confidence_level: Option<f64>,  // Tingkat kepercayaan untuk interval
    pub exclude_outliers: Option<bool>, // Apakah mengecualikan outlier
}
```

#### `data.rs`

Mendefinisikan struktur data input:

```rust
pub struct DataSet {
    pub values: Vec<f64>,            // Nilai numerik
    pub labels: Option<Vec<String>>, // Label opsional
}
```

#### `result.rs`

Mendefinisikan struktur untuk hasil analisis:

```rust
pub struct StatResult {
    pub success: bool,                 // Status keberhasilan
    pub result: Option<AnalysisResult>, // Hasil jika sukses
    pub errors: Vec<String>,           // Daftar error jika gagal
}

pub struct AnalysisResult {
    pub metrics: HashMap<String, f64>,             // Metrik hasil (mean, median, dll)
    pub derived_data: Option<Vec<f64>>,            // Data turunan (z-scores, dll)
    pub additional_info: Option<HashMap<String, String>>, // Info tambahan
}
```

### 2. Stats

Modul ini berisi implementasi algoritma statistik.

#### `core.rs`

Berisi fungsi-fungsi statistik utama:

- `analyze(data: &DataSet, config: &Config) -> StatResult`: Fungsi utama untuk analisis statistik
- Implementasi untuk berbagai metode statistik:
  - `calculate_mean`: Menghitung rata-rata
  - `calculate_median`: Menghitung median
  - `calculate_std_dev`: Menghitung standar deviasi
  - Dan lain-lain sesuai kebutuhan

### 3. Utils

Modul ini berisi fungsi-fungsi utilitas.

#### `converter.rs`

Fungsi-fungsi untuk konversi format:

- `parse_json_input(json_str: &str) -> Result<(DataSet, Config), StatError>`: Mengkonversi JSON menjadi struktur data
- `to_json_result(result: &StatResult) -> Result<String, StatError>`: Mengkonversi hasil analisis menjadi JSON

#### `error.rs`

Implementasi error handling:

```rust
pub enum StatError {
    EmptyData,                      // Data kosong
    UnsupportedMethod(String),      // Metode tidak didukung
    SerializationError(String),     // Error serialisasi
    InputError(String),             // Error input
}
```

### 4. WASM

Modul ini berisi binding ke WebAssembly untuk digunakan dengan JavaScript.

#### `constructor.rs`

Implementasi pendekatan berorientasi objek:

```rust
pub struct StatCalculator {
    data: DataSet,
    config: Config,
}

impl StatCalculator {
    pub fn new(json_str: &str) -> Result<StatCalculator, JsValue> {...}
    pub fn process(&self) -> String {...}
}
```

#### `function.rs`

Implementasi pendekatan fungsional:

```rust
pub fn calculate_stats(json_str: &str) -> String {...}
```

### 5. Test

Modul ini berisi komponen untuk pengujian.

#### `data.rs`

Data pengujian:

```rust
pub fn get_test_data() -> DataSet {...}
pub fn get_test_config() -> Config {...}
```

#### `example.rs`

Contoh penggunaan dan test case:

```rust
fn test_mean_calculation() {...}
```

## Alur Pemrosesan Data

Berikut adalah alur pemrosesan data dalam library:

1. **Input Data**
   - Menerima input dalam format JSON dari JavaScript
   - Mengkonversi JSON menjadi struct Rust (`DataSet` dan `Config`)

2. **Validasi Input**
   - Memeriksa kevalidan data dan konfigurasi
   - Mengumpulkan error jika ada

3. **Pemrosesan Statistik**
   - Menentukan metode statistik yang akan digunakan berdasarkan konfigurasi
   - Menerapkan algoritma statistik pada data
   - Menyimpan hasil dalam struktur `AnalysisResult`

4. **Pengembalian Hasil**
   - Mengemas hasil analisis dalam struktur `StatResult`
   - Mengkonversi hasil kembali ke format JSON
   - Mengembalikan hasil ke JavaScript

## Penggunaan di JavaScript

### Pendekatan Berorientasi Objek

```javascript
import { StatCalculator } from 'rust_stats_wasm';

// Input data dan konfigurasi
const inputData = {
  data: {
    values: [1.2, 3.4, 5.6, 7.8, 9.0],
    labels: null
  },
  config: {
    method: "mean",
    params: [],
    options: {
      exclude_outliers: true
    }
  }
};

// Membuat instance calculator
const calculator = new StatCalculator(JSON.stringify(inputData));

// Memproses data
const resultJson = calculator.process();
const result = JSON.parse(resultJson);

console.log("Hasil analisis:", result);
```

### Pendekatan Fungsional

```javascript
import { calculate_stats } from 'rust_stats_wasm';

// Input data dan konfigurasi
const inputData = {
  data: {
    values: [1.2, 3.4, 5.6, 7.8, 9.0],
    labels: null
  },
  config: {
    method: "std_dev",
    params: [],
    options: {
      confidence_level: 0.95
    }
  }
};

// Memanggil fungsi
const resultJson = calculate_stats(JSON.stringify(inputData));
const result = JSON.parse(resultJson);

console.log("Hasil analisis:", result);
```

## Pengembangan

### Menambahkan Metode Statistik Baru

1. Tambahkan implementasi metode di `stats/core.rs`:

```rust
fn calculate_new_method(data: &DataSet) -> StatResult {
    // Implementasi algoritma
    // ...
    
    // Hasilkan output
    StatResult {
        success: true,
        result: Some(AnalysisResult {
            metrics: metrics,
            derived_data: Some(derived_data),
            additional_info: None,
        }),
        errors: vec![],
    }
}
```

2. Tambahkan metode ke dalam match pattern di fungsi `analyze`:

```rust
match config.method.as_str() {
    "mean" => calculate_mean(data),
    "median" => calculate_median(data),
    "std_dev" => calculate_std_dev(data),
    "new_method" => calculate_new_method(data), // Metode baru
    _ => StatResult {
        success: false,
        result: None,
        errors: vec![format!("Method '{}' tidak didukung", config.method)],
    }
}
```

### Mengembangkan Struktur Hasil

Jika perlu menambahkan informasi tambahan ke hasil analisis:

1. Perbarui struktur `AnalysisResult` di `models/result.rs`
2. Pastikan implementasi serialisasi/deserialisasi sesuai (menggunakan serde)
3. Perbarui implementasi metode untuk mengisi data tambahan

## Build dan Deploy

### Build untuk WASM

```bash
wasm-pack build --target web
```

### Test

```bash
cargo test
wasm-pack test --node
```

### Penggunaan di Web

```html
<script type="module">
  import init, { StatCalculator, calculate_stats } from './pkg/rust_stats_wasm.js';

  async function run() {
    await init();
    
    // Gunakan fungsi statistik
    // ...
  }

  run();
</script>
```
