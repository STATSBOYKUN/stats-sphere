use crate::MacKinnonCriticalValues;
use csv;
use std::error::Error;
use wasm_bindgen::prelude::*;

pub fn read_critical_values() -> Result<Vec<MacKinnonCriticalValues>, Box<dyn Error>>{
    let csv_data = include_str!("mackinnon_critical_table.csv");
    let mut rdr = csv::Reader::from_reader(csv_data.as_bytes());
    let mut records = Vec::new();

    // Iterasi setiap record (header akan dilewati secara otomatis)
    for result in rdr.records() {
        let record = result?;

        // Parsing masing-masing field sesuai urutan kolom
        let level: String = record.get(0).unwrap().to_string();
        let variant: String = record.get(1).unwrap().to_string();
        let t: f64 = record.get(2).unwrap().parse()?;
        let u: f64 = record.get(3).unwrap().parse()?;
        let v: f64 = record.get(4).unwrap().parse()?;
        let w: f64 = record.get(5).unwrap().parse()?;

        records.push(MacKinnonCriticalValues::new(variant, level, t, u, v, w));
    }

    Ok(records)
}

#[wasm_bindgen]
pub fn get_t() -> Vec<String> {
    let mackinnon = read_critical_values().expect("Failed to read MacKinnon data");
    mackinnon.iter().map(|m| m.get_variant()).collect()
}