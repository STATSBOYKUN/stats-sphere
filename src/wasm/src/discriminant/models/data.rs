use serde_json::Value;
use crate::discriminant::utils::error::DiscriminantError;
use crate::discriminant::utils::converter;
use serde::{ Deserialize, Serialize };

/// Variable definition structure
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VarDef {
    pub name: String,
    pub r#type: String,
    pub label: String,
    pub values: String,
    pub missing: String,
    pub measure: String,
}

/// Input data for discriminant analysis
#[derive(Clone, Debug)]
pub struct Data {
    /// Group data for classification
    pub group_data: Vec<Vec<Value>>,

    /// Independent variable data
    pub independent_data: Vec<Vec<Value>>,

    /// Selection data for filtering (optional)
    pub selection_data: Option<Vec<Vec<Value>>>,

    /// Variable definitions for metadata (optional)
    pub var_defs: Option<Vec<VarDef>>,
}

impl Data {
    /// Create a new Data instance
    pub fn new(
        group_data: Vec<Vec<Value>>,
        independent_data: Vec<Vec<Value>>,
        selection_data: Option<Vec<Vec<Value>>>,
        var_defs: Option<Vec<VarDef>>
    ) -> Self {
        Self {
            group_data,
            independent_data,
            selection_data,
            var_defs,
        }
    }

    /// Extract group variable name
    pub fn extract_group_field_name(&self) -> Result<String, DiscriminantError> {
        if self.group_data.is_empty() || self.group_data[0].is_empty() {
            return Err(DiscriminantError::InvalidInput("Group data is empty".into()));
        }

        // First check if we have variable definitions
        if let Some(var_defs) = &self.var_defs {
            // Find the first group variable definition
            for var_def in var_defs {
                // Assuming the first variable is the group variable - this could be improved
                // by checking the data structure or adding a flag in VarDef
                return Ok(var_def.name.clone());
            }
        }

        // Fall back to extracting from the data if no definitions found
        match converter::extract_field_name(&self.group_data[0][0]) {
            Some(name) => Ok(name),
            None =>
                Err(DiscriminantError::InvalidInput("Could not determine group field name".into())),
        }
    }

    /// Extract variable field names
    pub fn extract_variable_field_names(&self) -> Result<Vec<String>, DiscriminantError> {
        let mut var_field_names = Vec::with_capacity(self.independent_data.len());

        // First check if we have variable definitions
        if let Some(var_defs) = &self.var_defs {
            // Extract names from variable definitions
            for var_def in var_defs {
                // Skip any variables that might be group or selection variables
                // This is a simplification - in a real implementation, there would be
                // more sophisticated logic to determine which variables are independent
                if !self.is_group_or_selection_variable(&var_def.name) {
                    var_field_names.push(var_def.name.clone());
                }
            }

            if !var_field_names.is_empty() {
                return Ok(var_field_names);
            }
        }

        // Fall back to extracting from the data if no definitions found
        for var_data in &self.independent_data {
            if !var_data.is_empty() {
                match converter::extract_field_name(&var_data[0]) {
                    Some(name) => var_field_names.push(name),
                    None => {
                        return Err(
                            DiscriminantError::InvalidInput(
                                "Could not determine variable field name".into()
                            )
                        );
                    }
                }
            } else {
                return Err(DiscriminantError::InvalidInput("Variable data is empty".into()));
            }
        }

        Ok(var_field_names)
    }

    /// Extract selection variable name
    pub fn extract_selection_field_name(&self) -> Result<Option<String>, DiscriminantError> {
        if let Some(selection_data) = &self.selection_data {
            if !selection_data.is_empty() && !selection_data[0].is_empty() {
                // First check if we have variable definitions
                if let Some(var_defs) = &self.var_defs {
                    // Find a selection variable definition
                    for var_def in var_defs {
                        // This is a simplification - in a real implementation, there would be
                        // more sophisticated logic to determine which variable is the selection variable
                        if self.is_selection_variable(&var_def.name) {
                            return Ok(Some(var_def.name.clone()));
                        }
                    }
                }

                // Fall back to extracting from the data
                match converter::extract_field_name(&selection_data[0][0]) {
                    Some(name) => {
                        return Ok(Some(name));
                    }
                    None => {
                        return Err(
                            DiscriminantError::InvalidInput(
                                "Could not determine selection field name".into()
                            )
                        );
                    }
                }
            }
        }

        Ok(None)
    }

    /// Check if a variable name is likely a group or selection variable
    fn is_group_or_selection_variable(&self, name: &str) -> bool {
        // Check if the variable name appears in group data
        if !self.group_data.is_empty() && !self.group_data[0].is_empty() {
            if let Some(group_name) = converter::extract_field_name(&self.group_data[0][0]) {
                if group_name == name {
                    return true;
                }
            }
        }

        // Check if the variable name appears in selection data
        if let Some(selection_data) = &self.selection_data {
            if !selection_data.is_empty() && !selection_data[0].is_empty() {
                if let Some(selection_name) = converter::extract_field_name(&selection_data[0][0]) {
                    if selection_name == name {
                        return true;
                    }
                }
            }
        }

        false
    }

    /// Check if a variable name is likely a selection variable
    fn is_selection_variable(&self, name: &str) -> bool {
        if let Some(selection_data) = &self.selection_data {
            if !selection_data.is_empty() && !selection_data[0].is_empty() {
                if let Some(selection_name) = converter::extract_field_name(&selection_data[0][0]) {
                    return selection_name == name;
                }
            }
        }

        false
    }

    /// Extract unique group values
    pub fn extract_unique_groups(
        &self,
        group_field_name: &str,
        min_range: f64,
        max_range: f64
    ) -> Result<Vec<usize>, DiscriminantError> {
        let mut unique_groups = Vec::new();

        for group_list in &self.group_data {
            for group_item in group_list {
                if
                    let Some(group_value) = group_item
                        .get(group_field_name)
                        .and_then(|val| val.as_u64())
                        .map(|val| val as usize)
                {
                    // Only include groups within the specified range
                    if group_value >= (min_range as usize) && group_value <= (max_range as usize) {
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

    /// Filter the data based on a selection variable and value
    pub fn filter_by_selection(
        &self,
        selection_field_name: &str,
        filter_value: f64
    ) -> Result<Self, DiscriminantError> {
        if self.selection_data.is_none() {
            return Ok(self.clone());
        }

        let selection_data = self.selection_data.as_ref().unwrap();
        if selection_data.is_empty() || selection_data[0].is_empty() {
            return Ok(self.clone());
        }

        // Create a map of indices to include based on the selection criterion
        let mut include_indices = Vec::new();

        for (idx, selection_item) in selection_data[0].iter().enumerate() {
            if
                let Some(value) = selection_item
                    .get(selection_field_name)
                    .and_then(|val| val.as_f64())
            {
                if (value - filter_value).abs() < std::f64::EPSILON {
                    include_indices.push(idx);
                }
            }
        }

        // Filter the data arrays
        let filtered_group_data = self.group_data
            .iter()
            .map(|items| {
                include_indices
                    .iter()
                    .filter_map(|&idx| {
                        if idx < items.len() { Some(items[idx].clone()) } else { None }
                    })
                    .collect()
            })
            .collect();

        let filtered_independent_data = self.independent_data
            .iter()
            .map(|items| {
                include_indices
                    .iter()
                    .filter_map(|&idx| {
                        if idx < items.len() { Some(items[idx].clone()) } else { None }
                    })
                    .collect()
            })
            .collect();

        // Create a new Data instance with the filtered data
        Ok(Data {
            group_data: filtered_group_data,
            independent_data: filtered_independent_data,
            selection_data: None, // No need to keep selection data after filtering
            var_defs: self.var_defs.clone(),
        })
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
                return Err(
                    DiscriminantError::InvalidInput(
                        "All variables must have the same number of cases".into()
                    )
                );
            }
        }

        // Check selection data dimensions if available
        if let Some(selection_data) = &self.selection_data {
            if !selection_data.is_empty() {
                for select_var in selection_data {
                    if select_var.len() != num_cases {
                        return Err(
                            DiscriminantError::InvalidInput(
                                "Selection variable must have the same number of cases".into()
                            )
                        );
                    }
                }
            }
        }

        Ok(())
    }
}
