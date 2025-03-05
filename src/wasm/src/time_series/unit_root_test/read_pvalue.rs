use crate::MacKinnonPValue;
use csv;
use std::error::Error;
use wasm_bindgen::prelude::*;

pub fn read_pvalue() -> Result<Vec<MacKinnonPValue>, Box<dyn Error>>{
    let csv_data = include_str!("mackinnon_pvalue_table.csv");
    let mut rdr = csv::Reader::from_reader(csv_data.as_bytes());
    let mut records = Vec::new();

    // Iterasi setiap record (header akan dilewati secara otomatis)
    for result in rdr.records() {
        let record = result?;

        // Parsing masing-masing field sesuai urutan kolom
        let variant: String = record.get(0).unwrap().to_string();
        let n: u8 = record.get(1).unwrap().parse()?;
        let gamma_0_tab1: f64 = record.get(2).unwrap().parse()?;
        let gamma_1_tab1: f64 = record.get(3).unwrap().parse()?;
        let gamma_2_tab1: f64 = record.get(4).unwrap().parse()?;
        let gamma_0_tab2: f64 = record.get(5).unwrap().parse()?;
        let gamma_1_tab2: f64 = record.get(6).unwrap().parse()?;
        let gamma_2_tab2: f64 = record.get(7).unwrap().parse()?;
        let gamma_3_tab2: f64 = record.get(8).unwrap().parse()?;
        let tau_min: f64 = record.get(9).unwrap().parse()?;
        let tau_center: f64 = record.get(10).unwrap().parse()?;
        let tau_max: f64 = record.get(11).unwrap().parse()?;

        records.push(MacKinnonPValue::new(
            variant, 
            n, 
            gamma_0_tab1,
            gamma_1_tab1,
            gamma_2_tab1,
            gamma_0_tab2,
            gamma_1_tab2,
            gamma_2_tab2,
            gamma_3_tab2,
            tau_min,
            tau_center,
            tau_max,
        ));
    }

    Ok(records)
}

#[wasm_bindgen]
pub fn get_gamma_0_tab1() -> Vec<f64> {
    let mackinnon = read_pvalue().expect("Failed to read MacKinnon data");
    mackinnon.iter().map(|m| m.get_gamma_0_tab1()).collect()
}