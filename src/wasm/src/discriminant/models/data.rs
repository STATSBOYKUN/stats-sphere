use serde_json::Value;
use std::collections::HashMap;
use crate::discriminant::utils::error::DiscriminantError;
use crate::discriminant::utils::converter;

/// Input data for discriminant analysis
#[derive(Clone, Debug)]
pub struct Data {
    /// Group data for classification
    pub group_data: Vec<Vec<Value>>,
    
    /// Independent variable data
    pub independent_data: Vec<Vec<Value>>,
}

impl Data {
    /// Create a new Data instance
    pub fn new(group_data: Vec<Vec<Value>>, independent_data: Vec<Vec<Value>>) -> Self {
        Self {
            group_data,
            independent_data,
        }
    }
    
    /// Extract group variable name
    pub fn extract_group_field_name(&self) -> Result<String, DiscriminantError> {
        if self.group_data.is_empty() || self.group_data[0].is_empty() {
            return Err(DiscriminantError::InvalidInput("Group data is empty".into()));
        }
        
        match converter::extract_field_name(&self.group_data[0][0]) {
            Some(name) => Ok(name),
            None => Err(DiscriminantError::InvalidInput(
                "Could not determine group field name".into()
            )),
        }
    }
    
    /// Extract variable field names
    pub fn extract_variable_field_names(&self) -> Result<Vec<String>, DiscriminantError> {
        let mut var_field_names = Vec::with_capacity(self.independent_data.len());
        
        for var_data in &self.independent_data {
            if !var_data.is_empty() {
                match converter::extract_field_name(&var_data[0]) {
                    Some(name) => var_field_names.push(name),
                    None => return Err(DiscriminantError::InvalidInput(
                        "Could not determine variable field name".into()
                    )),
                }
            } else {
                return Err(DiscriminantError::InvalidInput("Variable data is empty".into()));
            }
        }
        
        Ok(var_field_names)
    }
    
    /// Extract unique group values
    pub fn extract_unique_groups(&self, group_field_name: &str, min_range: f64, max_range: f64) 
        -> Result<Vec<usize>, DiscriminantError> 
    {
        let mut unique_groups = Vec::new();
        
        for group_list in &self.group_data {
            for group_item in group_list {
                if let Some(group_value) = group_item.get(group_field_name)
                    .and_then(|val| val.as_u64())
                    .map(|val| val as usize) {
                    // Only include groups within the specified range
                    if group_value >= min_range as usize && group_value <= max_range as usize {
                        if !unique_groups.contains(&group_value) {
                            unique_groups.push(group_value);
                        }
                    }
                }
            }
        }
        
        // Sort the groups
        unique_groups.sort();
        
        // Check if we have at least one valid group after filtering
        if unique_groups.is_empty() {
            return Err(DiscriminantError::NotEnoughGroups);
        }
        
        Ok(unique_groups)
    }
    
    /// Validate the data dimensions
    pub fn validate(&self) -> Result<(), DiscriminantError> {
        if self.group_data.is_empty() {
            return Err(DiscriminantError::InvalidInput("No group data provided".into()));
        }

        if self.independent_data.is_empty() {
            return Err(DiscriminantError::InvalidInput("No independent variables provided".into()));
        }
        
        // Determine the number of cases
        let num_cases = if !self.group_data[0].is_empty() {
            self.group_data[0].len()
        } else {
            return Err(DiscriminantError::InsufficientData);
        };
        
        // Check that all variables have the same number of cases
        for var_data in &self.independent_data {
            if var_data.len() != num_cases {
                return Err(DiscriminantError::InvalidInput(
                    "All variables must have the same number of cases".into()
                ));
            }
        }
        
        Ok(())
    }
}