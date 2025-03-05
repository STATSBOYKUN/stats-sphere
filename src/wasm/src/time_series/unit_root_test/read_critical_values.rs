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
        let n: u8 = record.get(0).unwrap().parse()?;
        let variant = record.get(1).unwrap().to_string();
        let level = record.get(2).unwrap().to_string();
        let obs: u16 = record.get(3).unwrap().parse()?;
        let beta_inf: f64 = record.get(4).unwrap().parse()?;
        let beta_1: f64 = record.get(5).unwrap().parse()?;
        let beta_2: f64 = record.get(6).unwrap().parse()?;

        records.push(MacKinnonCriticalValues::new(n, variant, level, obs, beta_inf, beta_1, beta_2));
    }

    Ok(records)
}

#[wasm_bindgen]
pub fn get_beta_inf() -> Vec<f64> {
    let mackinnon = read_critical_values().expect("Failed to read MacKinnon data");
    mackinnon.iter().map(|m| m.get_beta_inf()).collect()
}