# Hierarchical Clustering Library

A comprehensive implementation of hierarchical clustering algorithms in Rust with WebAssembly bindings for use in web applications.

## Features

- Multiple linkage methods:
  - Average Linkage Between Groups
  - Average Linkage Within Groups
  - Single Linkage
  - Complete Linkage
  - Centroid Method
  - Median Method
  - Ward's Method

- Various distance metrics:
  - Euclidean
  - Squared Euclidean
  - Manhattan (City Block)
  - Chebyshev
  - Cosine
  - Correlation
  - Jaccard (for binary data)
  - Chi-Square (for count data)
  - Minkowski (with customizable power parameter)

- Data preprocessing options:
  - Multiple standardization methods (Z-score, range scaling, etc.)
  - Missing value handling strategies
  - Distance transformations

- Comprehensive output:
  - Agglomeration schedule
  - Proximity matrix
  - Cluster membership for single or multiple solutions
  - Dendrogram data for visualization
  - Cluster evaluation metrics (Silhouette coefficient, SSE, SSB, predictor importance)

## Building the Library

### Prerequisites

- Rust toolchain (1.60 or later)
- wasm-pack for WebAssembly compilation

### Build Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hierarchical_clustering.git
   cd hierarchical_clustering
   ```

2. Build the WebAssembly package:
   ```
   wasm-pack build --target web
   ```

3. The compiled WebAssembly module will be available in the `pkg` directory.

## Usage

### In a Web Application

1. Import the WebAssembly module:
   ```javascript
   import * as clustering from './hierarchical_clustering';
   
   // Initialize the module
   await clustering.init();
   ```

2. Create a clustering configuration:
   ```javascript
   const config = {
     method: {
       ClusMethod: "AverageBetweenGroups", // linkage method
       Interval: true,                     // using interval data
       IntervalMethod: "Euclidean",        // distance metric
       StandardizeMethod: "ZScore",        // standardization method
       ByVariable: true                    // standardize by variable
     },
     statistics: {
       AgglSchedule: true,                 // generate agglomeration schedule
       ProxMatrix: true,                   // generate proximity matrix
       SingleSol: true,                    // get a single solution
       NoOfCluster: 3                      // number of clusters
     },
     plots: {
       Dendrograms: true                   // generate dendrogram data
     }
   };
   
   // Parse the configuration
   const parsedConfig = clustering.parse_clustering_config(config);
   ```

3. Prepare your data:
   ```javascript
   // Example data format: array of variables
   const data = [
     // Variable 1 (e.g., age)
     [{age: 16}, {age: 17}, {age: 19}, ...],
     
     // Variable 2 (e.g., income)
     [{income: 8}, {income: 8}, {income: 9}, ...]
   ];
   ```

4. Perform clustering:
   ```javascript
   // Create clustering instance
   const clusterAnalysis = new clustering.HierarchicalClusteringWasm(data, parsedConfig);
   
   // Preprocess data
   clusterAnalysis.preprocess_data();
   
   // Calculate distances
   clusterAnalysis.calculate_distances();
   
   // Perform clustering
   clusterAnalysis.cluster();
   
   // Get results
   const numClusters = 3;
   const clusterSolution = clusterAnalysis.get_clusters(numClusters);
   const evaluation = clusterAnalysis.evaluate(numClusters);
   const dendrogramData = clusterAnalysis.get_dendrogram_data();
   ```

5. Visualize the results:
   ```javascript
   // Example: Create a dendrogram visualization
   function createDendrogram(container, dendrogramData) {
     // Implement visualization using D3.js or another library
     // ...
   }
   
   const container = document.getElementById('dendrogram-container');
   createDendrogram(container, dendrogramData);
   ```

### Advanced Usage

This library supports many advanced options for hierarchical clustering:

#### Binary Data

For binary data, use the Jaccard distance metric:

```javascript
const binaryConfig = {
  method: {
    ClusMethod: "AverageBetweenGroups",
    Binary: true,
    BinaryMethod: "Jaccard",
    Present: 1,  // Value representing presence
    Absent: 0    // Value representing absence
  }
};
```

#### Count Data

For count data (e.g., frequency tables), use the Chi-Square distance:

```javascript
const countConfig = {
  method: {
    ClusMethod: "AverageBetweenGroups",
    Counts: true,
    CountsMethod: "ChiSquare"
  }
};
```

#### Cluster Range Solutions

To get multiple cluster solutions in a range:

```javascript
const rangeConfig = {
  statistics: {
    RangeSol: true,
    MinCluster: 2,
    MaxCluster: 5
  }
};

// After clustering
const clusterSolutions = clusterAnalysis.get_clusters_range(2, 5);
```

## Documentation

For complete API documentation, see the source code and comments. Each function and data structure is documented with detailed descriptions and examples.

## License

This project is licensed under the MIT License - see the LICENSE file for details.