# E-Commerce Customer Intelligence & Product Recommendation System Using Data Mining and Data Warehousing

> **Academic Project — Third Year Computer Engineering**  
> **Course:** Data Mining and Data Warehousing (DWDM)  
> **Architecture:** Full-Stack Web Application (React + Vite + Flask + Scikit-Learn + mlxtend + MySQL / SQLite Star Schema)

---

## 🌟 Executive Summary

This academic project implements an end-to-end full-stack web application designed to analyze e-commerce customer behavior, transaction patterns, and sales performance using core **Data Mining** algorithms and a **Dimensional Data Warehouse (Star Schema)**.

The system connects raw transaction logs to intelligent business decisions through:
1. **Data Preprocessing & Cleaning**: Missing value imputation, duplicate elimination, Tukey's IQR outlier capping, scaling, binning, and feature selection.
2. **Customer Segmentation (Clustering)**: Unsupervised K-Means clustering with dynamic $K$ selection, Silhouette Coefficient evaluation, Elbow method, and 2D PCA visualization.
3. **Repurchase Prediction (Classification)**: Supervised learning comparing Decision Tree, Gaussian Naive Bayes, K-Nearest Neighbors, and Random Forest with live real-time inference.
4. **Market Basket Analysis (Association Rules)**: Itemset mining comparing Apriori and FP-Growth algorithms with Support, Confidence, and Lift metrics.
5. **Hybrid Recommendation System**: Combining association antecedents with customer purchase history to deliver personalized product suggestions.
6. **Data Warehousing & OLAP**: Dimensional Star Schema model with a central `Fact_Sales` table surrounded by `Dim_Customer`, `Dim_Product`, `Dim_Store`, and `Dim_Time`, supporting **Roll-up, Drill-down, Slice, and Dice** analytical operations.

---

## 🏗️ Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, React Router v7, HTML5, Vanilla CSS3 | Modern, responsive dashboard SPA |
| **Data Visualization** | Recharts, Lucide React Icons | Interactive Area, Bar, Pie, Scatter, and Line charts |
| **API Client** | Axios | RESTful asynchronous HTTP communication |
| **Backend Framework** | Python 3.12, Flask, Flask-CORS | Modular REST API service |
| **Data Science / ML** | Pandas, NumPy, Scikit-learn, mlxtend, SciPy | Preprocessing, K-Means, Classifiers, Association Rules |
| **Database / Warehouse** | MySQL 8.0 & SQLite (with auto-fallback) | Star Schema storage (Facts & Dimensions) |
| **ORM / Query Engine** | SQLAlchemy, PyMySQL | Dimensional data ingestion & OLAP aggregation |

---

## 📁 Project Structure

```
ecommerce-data-mining/
│
├── frontend/                               # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Top navigation with DB status pill and profile
│   │   │   ├── Sidebar.jsx                 # Responsive sidebar with 10 module links
│   │   │   ├── StatCard.jsx                # Reusable KPI metric card
│   │   │   └── LoadingSpinner.jsx          # Animated spinner with status text
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             # User authentication and session management
│   │   │   └── ToastContext.jsx            # Toast alerts notification stack
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx               # Page 1: Auth login with demo credentials
│   │   │   ├── DashboardPage.jsx           # Page 2: Executive KPI dashboard & charts
│   │   │   ├── DatasetUploadPage.jsx       # Page 3: CSV upload, preview, and schema health
│   │   │   ├── PreprocessingPage.jsx       # Page 4: Cleaning, imputation, and before/after stats
│   │   │   ├── ClusteringPage.jsx          # Page 5: K-Means, Silhouette, PCA scatter, Elbow
│   │   │   ├── ClassificationPage.jsx      # Page 6: 4 ML models comparison & live inference
│   │   │   ├── AssociationPage.jsx         # Page 7: Apriori vs FP-Growth association rules
│   │   │   ├── RecommendationPage.jsx      # Page 8: Hybrid product recommendation engine
│   │   │   ├── DataWarehousePage.jsx       # Page 9: Interactive Star Schema visual topology
│   │   │   ├── OlapPage.jsx                # Page 10: Roll-up, Drill-down, Slice, and Dice
│   │   │   └── ReportPage.jsx              # Page 11: Comprehensive report with PDF & CSV export
│   │   ├── services/
│   │   │   └── api.js                      # Axios client calling backend REST endpoints
│   │   ├── App.jsx                         # React Router setup & protected layout
│   │   ├── main.jsx                        # React root entry point
│   │   └── index.css                       # Modern CSS design system
│   └── package.json
│
├── backend/                                # Python Flask REST API backend
│   ├── algorithms/
│   │   ├── preprocessing.py                # Cleaning, scaling, IQR outliers, encoding
│   │   ├── clustering.py                   # KMeans, Silhouette, PCA, Elbow curve
│   │   ├── classification.py               # DT, GNB, KNN, RF training & inference
│   │   ├── association.py                  # Apriori & FP-Growth using mlxtend
│   │   ├── recommendation.py               # Rule-based & customer history recommendations
│   │   └── olap.py                         # Rollup, Drilldown, Slice, Dice calculations
│   ├── database/
│   │   └── connection.py                   # MySQL / SQLite Star Schema engine & seeder
│   ├── routes/
│   │   ├── auth_routes.py                  # POST /api/auth/login
│   │   ├── dataset_routes.py               # /api/dataset/upload, /preview, /statistics
│   │   ├── mining_routes.py                # ML execution endpoints
│   │   └── analytics_routes.py             # Dashboard, Warehouse, OLAP, and Report endpoints
│   ├── dataset_manager.py                  # Active dataset memory caching
│   ├── app.py                              # Flask application entry point with CORS
│   └── requirements.txt                    # Python dependencies
│
├── dataset/
│   ├── sample_sales.csv                    # 975 multi-attribute realistic transactions
│   └── generate_dataset.py                 # Dataset generator script with market basket patterns
│
├── database/
│   └── schema.sql                          # MySQL Star Schema DDL & seed script
│
├── verify_full_system.py                   # Automated end-to-end verification script
└── README.md                               # Complete project documentation & Viva Q&A
```

---

## 🔄 Data Mining & Data Warehousing Pipeline Flow

```
                      Raw E-Commerce Dataset (CSV / MySQL)
                                       │
                                       ▼
                              Data Preprocessing
                 ┌─────────────────────┴─────────────────────┐
                 │ • Missing Value Imputation (Median / Mode)│
                 │ • Duplicate Row Elimination              │
                 │ • Outlier Capping (Tukey's IQR 1.5×)      │
                 │ • Discretization (Age & Spending Tiers)   │
                 │ • Normalization & Standardization (Z-score)│
                 │ • Feature Selection (Correlation Matrix)  │
                 └─────────────────────┬─────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        Unsupervised Clustering               Supervised Classification
         • K-Means Algorithm                   • Decision Tree
         • Silhouette Coefficient              • Naive Bayes (Gaussian)
         • Elbow Curve (Inertia vs K)          • K-Nearest Neighbors (KNN)
         • PCA 2D Scatter Projection           • Random Forest
         • Profiles: VIP, Loyal, Occasional    • Metrics: Acc, Prec, Rec, F1
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                       Market Basket Association Mining
                        • Apriori vs FP-Growth Comparison
                        • Frequent Itemsets Extraction
                        • Rules: Antecedents → Consequents
                        • Evaluation: Support, Confidence, Lift
                                       │
                                       ▼
                          Hybrid Recommendation Engine
                        • "You May Also Like" Inference
                        • Basket Antecedent Pattern Matching
                        • Customer Historical Affinity
                                       │
                                       ▼
                        Data Warehouse & OLAP Cube
                        • Star Schema Architecture
                        • Roll-up, Drill-down, Slice, Dice
                                       │
                                       ▼
                        Consolidated Academic Report
                        • Executive Dashboard Visualization
                        • PDF Print & CSV Export
```

---

## 🏛️ Star Schema Architecture

The data warehouse implements a classic **Star Schema** optimized for online analytical processing (OLAP):

```
                        ┌────────────────────────┐
                        │      Dim_Customer      │
                        ├────────────────────────┤
                        │ PK  customer_id        │
                        │     name               │
                        │     age                │
                        │     gender             │
                        │     location           │
                        └───────────┬────────────┘
                                    │
                                    │ 1 : N
                                    │
┌───────────────────────┐           ▼            ┌───────────────────────┐
│      Dim_Product      │      ┌─────────┐       │       Dim_Store       │
├───────────────────────┤      │  FACT_  │       ├───────────────────────┤
│ PK  product_id        ├─────►│  SALES  │◄──────┤ PK  store_id          │
│     product_name      │1 : N └─────────┘ N : 1 │     store_name        │
│     category          │           ▲            │     region            │
│     price             │           │            └───────────────────────┘
└───────────────────────┘           │ N : 1
                                    │
                        ┌───────────┴────────────┐
                        │        Dim_Time        │
                        ├────────────────────────┤
                        │ PK  time_id            │
                        │     date               │
                        │     day                │
                        │     month              │
                        │     quarter            │
                        │     year               │
                        └────────────────────────┘
```

### Fact Table: `sales_fact`
- **Primary Key:** `sales_id`
- **Foreign Keys:** `customer_id`, `product_id`, `store_id`, `time_id`
- **Additive Measures:** `quantity`, `total_amount`
- **Degenerate Dimension:** `transaction_id`

---

## 🚀 Setup & Installation Instructions

### Prerequisites
1. **Python 3.10+** (Tested on Python 3.12)
2. **Node.js 18+** (Tested on Node.js v24)
3. **MySQL Server 8.0+** (Optional — SQLite fallback is enabled by default so the app runs out of the box even without MySQL running!)

---

### Step 1: Backend Setup

1. Open a terminal in the backend directory:
   ```bash
   cd "d:\DWDM project\ecommerce-data-mining\backend"
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. *(Optional)* Configure MySQL in `.env` if you wish to use MySQL instead of the SQLite fallback:
   Create a `.env` file inside `backend/`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=ecommerce_data_mining
   PORT=5000
   ```
   > **Note:** If MySQL credentials are not supplied or the MySQL service is offline, the backend automatically falls back to an integrated SQLite Star Schema database (`database/ecommerce_data_mining.db`) so presentations and demos never fail.

4. Start the Flask backend server:
   ```bash
   python app.py
   ```
   *The backend will start at: `http://127.0.0.1:5000`*

---

### Step 2: Frontend Setup

1. Open a new terminal in the frontend directory:
   ```bash
   cd "d:\DWDM project\ecommerce-data-mining\frontend"
   ```

2. Install npm dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   *The frontend dashboard will be accessible at: `http://127.0.0.1:5173`*

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@ecommerce.com` | `admin123` | Full Access to all 10 modules |
| **Data Analyst** | `analyst@ecommerce.com` | `analyst123` | Model training & OLAP inspection |
| **Student** | `student@ecommerce.com` | `student123` | Read & interactive simulation |

*(The Login Page also contains 1-click quick-fill buttons for instant demo access)*

---

## 🧪 Automated Verification Suite

To verify that all REST API endpoints and the Vite frontend server are running properly, execute:
```bash
python "d:\DWDM project\ecommerce-data-mining\verify_full_system.py"
```

Expected Output:
```
=== 1. VERIFYING FRONTEND VITE SERVER ===
[PASS] Frontend Vite Server OK (Status 200, Root element found)

=== 2. VERIFYING BACKEND REST APIS ===
[PASS] Health Check: 200 -> DB Type: sqlite
[PASS] Auth Login: 200 -> User: System Administrator, Role: admin
[PASS] Dashboard Stats: 200 -> Revenue: Rs.3019638.0, Customers: 35, Most Purchased: Bread
[PASS] Dataset Preview: 200 -> Rows: 975, Columns: 26
[PASS] Preprocessing Results: 200 -> Clean Records: 950, Missing: 0
[PASS] K-Means Clustering: 200 -> K=4, Silhouette: 0.3747, Profiles: 4
[PASS] Classification Models: 200 -> Best Model: Random Forest
   * Decision Tree: Accuracy=86.39%, F1=92.02%
   * Naive Bayes: Accuracy=73.3%, F1=82.23%
   * K-Nearest Neighbors: Accuracy=84.82%, F1=91.24%
   * Random Forest: Accuracy=87.96%, F1=93.01%
[PASS] Live Prediction: 200 -> Result: 'Likely to Purchase Again' with 82.7% confidence
[PASS] Apriori Mining: 200 -> 30 rules discovered in 1.68 ms
[PASS] FP-Growth Mining: 200 -> 30 rules discovered in 0.0 ms
[PASS] Product Recommendations: 200 -> Found 5 recommended items
[PASS] Warehouse Star Schema: 200 -> Fact: sales_fact, Dimensions: 4
[PASS] OLAP Dice Operation: 200 -> Multi-dimensional matrix with 4 regions
[PASS] Academic Report: 200 -> Title: 'E-Commerce Customer Intelligence & Product Recommendation System'
```

---

## 📡 REST API Documentation

### 1. Authentication
- `POST /api/auth/login`
  - Body: `{"email": "admin@ecommerce.com", "password": "admin123"}`
  - Returns: JWT session mock token, user ID, name, role.

### 2. Dataset Management
- `POST /api/dataset/upload` — Ingests uploaded multipart CSV.
- `POST /api/dataset/reset` — Resets active dataset to the 975-row benchmark.
- `GET /api/dataset/preview?limit=20&offset=0` — Returns paginated raw records.
- `GET /api/dataset/statistics` — Returns missing counts, data types, duplicate count.

### 3. Data Preprocessing
- `POST /api/preprocessing`
  - Body: `{"imputation_strategy": "median_mode", "handle_outliers": true, "scaling": "standard"}`
  - Returns: Before vs After stats, histograms, boxplot 5-number summaries, correlation scores.
- `GET /api/preprocessing/results` — Returns cached preprocessing baseline.

### 4. Customer Clustering
- `POST /api/clustering`
  - Body: `{"k": 4}`
  - Returns: Silhouette score, Elbow curve data, 2D PCA coordinates, cluster centroids, and meaningful segment labels (Premium VIP, Regular Loyal, Occasional).
- `GET /api/clustering/results` — Retrieves latest clustering model.

### 5. Customer Classification
- `POST /api/classification/train` — Trains Decision Tree, Naive Bayes, KNN, Random Forest; returns Accuracy, Precision, Recall, F1, and Confusion Matrix.
- `POST /api/classification/predict`
  - Body: `{"age": 28, "gender": "Female", "location": "Mumbai", "previous_purchases": 12, "total_spending": 7500, "purchase_frequency": 1.8, "days_since_last_purchase": 10, "model": "Random Forest"}`
  - Returns: `"Likely to Purchase Again"` vs `"Unlikely"`, confidence %, and voting consensus.

### 6. Association Rule Mining
- `POST /api/association/apriori` & `POST /api/association/fpgrowth`
  - Body: `{"min_support": 0.03, "min_confidence": 0.3}`
  - Returns: Frequent itemsets, discovered rules, execution time in ms, support, confidence, lift.

### 7. Product Recommendations
- `POST /api/recommendation`
  - Body: `{"products": ["Tea", "Biscuits"]}` or `{"customer_id": "C0001"}`
  - Returns: "You May Also Like" items with match scores, prices, categories, and antecedent association reasons.

### 8. Analytics & Data Warehouse
- `GET /api/dashboard/statistics` — 8 primary KPI metrics and best-selling items.
- `GET /api/sales/monthly`, `/api/sales/category`, `/api/sales/region` — Aggregated fact data.
- `GET /api/warehouse/schema` — Star Schema metadata, foreign keys, measures.
- `GET /api/olap/analysis?operation=dice&level=month` — Roll-up, Drill-down, Slice, Dice.
- `GET /api/report/generate` — Complete consolidated academic report.

---

## 🎓 Academic Viva Questions & Answers (DWDM)

### Q1: What is the difference between Data Warehousing (DW) and Data Mining (DM)?
**Answer:**
- **Data Warehousing** is the process of collecting, integrating, cleaning, and storing data from heterogeneous sources into a subject-oriented, integrated, time-variant, and non-volatile repository (such as our Star Schema) optimized for analytical reporting.
- **Data Mining** is the process of extracting implicit, previously unknown, and actionable patterns, rules, and anomalies from the stored warehouse data using machine learning algorithms (e.g., K-Means for clustering, Apriori for market baskets, Random Forest for classification).

---

### Q2: Why did we choose a Star Schema over a Snowflake Schema for this project?
**Answer:**
- **Simplicity & Performance:** The Star Schema de-normalizes dimension tables into single flat structures (`Dim_Customer`, `Dim_Product`, etc.). This reduces the number of complex SQL `JOIN` operations required during OLAP roll-ups and drill-downs, dramatically improving query throughput.
- **Snowflake Schema Tradeoff:** Snowflake normalizes dimensions into sub-tables (e.g., separating Store into Store, City, and Region tables). While it saves marginal disk storage by reducing data redundancy, it introduces significant join overhead for analytical queries.

---

### Q3: What are the fundamental OLAP operations implemented in this system?
**Answer:**
1. **Roll-up:** Summarizes data by climbing up a dimensional hierarchy (e.g., aggregating daily transaction amounts into monthly or yearly revenue totals).
2. **Drill-down:** The inverse of roll-up; de-aggregates data to examine finer granularity (e.g., viewing individual sales dates within a given quarter).
3. **Slice:** Performs a selection on one dimension to produce a sub-cube (e.g., analyzing sales strictly where `category = 'Electronics'`).
4. **Dice:** Defines a sub-cube by selecting specific values across two or more dimensions simultaneously (e.g., `region IN ('North', 'West') AND category IN ('Bakery & Dairy', 'Electronics')`).

---

### Q4: How is Missing Value Imputation handled during Preprocessing?
**Answer:**
Missing values are handled based on attribute data types:
- **Numerical Features (e.g., age, total_spending, recency):** Imputed using the **Median** or **Mean**. The median is preferred because it is robust against skewed distributions and outliers.
- **Categorical Features (e.g., gender, category):** Imputed using the **Mode** (the most frequent value) or marked with a dedicated token like `"Unknown"`.

---

### Q5: How does the system detect and treat Outliers?
**Answer:**
We implement **Tukey’s Interquartile Range (IQR) method**:
1. Calculate the 25th percentile ($Q_1$) and 75th percentile ($Q_3$).
2. Compute $\text{IQR} = Q_3 - Q_1$.
3. Define the lower boundary as $Q_1 - 1.5 \times \text{IQR}$ and upper boundary as $Q_3 + 1.5 \times \text{IQR}$.
4. Values falling outside this range are capped (Winsorized) to the boundary thresholds rather than deleted, preserving transaction volume while preventing model distortion.

---

### Q6: What is the difference between Normalization (MinMaxScaler) and Standardization (StandardScaler)?
**Answer:**
- **Normalization (MinMaxScaler):** Rescales numerical values into a bounded range, typically $[0, 1]$ using:
  $$X_{\text{norm}} = \frac{X - X_{\min}}{X_{\max} - X_{\min}}$$
  Ideal when algorithms assume bounded scales or when distributions are uniform.
- **Standardization (StandardScaler / Z-Score):** Transforms features to have a mean of $0$ and standard deviation of $1$:
  $$Z = \frac{X - \mu}{\sigma}$$
  Standardization is essential for distance-based algorithms like **K-Means Clustering** and **K-Nearest Neighbors (KNN)** to ensure high-magnitude features (like total spending in thousands) do not dominate low-magnitude features (like age or order frequency).

---

### Q7: How does K-Means Clustering work and how is the optimal $K$ evaluated?
**Answer:**
1. **Algorithm:** Given a user-defined $K$, the algorithm randomly initializes $K$ centroids, assigns each customer to the nearest centroid using Euclidean distance, recomputes centroids as the mean of assigned points, and repeats until convergence.
2. **Elbow Method:** Plots Inertia (Sum of Squared Errors / SSE) against varying $K$ values. The "elbow" bend represents the point of diminishing returns.
3. **Silhouette Score:** Evaluates cluster cohesion (distance to points in the same cluster, $a$) versus cluster separation (distance to points in the nearest neighboring cluster, $b$):
  $$s = \frac{b - a}{\max(a, b)}$$
  Scores range from $-1$ to $+1$, where values $> 0.35$ demonstrate distinct, well-separated customer cohorts.

---

### Q8: What customer segments were identified by the system?
**Answer:**
Based on centroid analysis:
- **Premium VIP Customers:** High total spending ($\text{Avg} > \text{Rs.} 20,000$), frequent purchases, and low recency ($< 15$ days). Target: Exclusive VIP rewards and early access.
- **Regular Loyal Customers:** Moderate spending, steady frequency, and active recency. Target: Loyalty points and cross-selling.
- **Occasional / Budget Shoppers:** Lower spending and lower purchase frequency. Target: Bundle discounts and price incentives.
- **At-Risk / Dormant Customers:** High recency ($> 60$ days since last order) despite previous purchase history. Target: Win-back marketing and reactivation discounts.

---

### Q9: Why compare Decision Tree, Naive Bayes, KNN, and Random Forest?
**Answer:**
To evaluate differing inductive biases on customer tabular data:
- **Decision Tree:** Highly interpretable white-box model based on Information Gain / Gini impurity.
- **Naive Bayes:** Probabilistic classifier assuming conditional independence between features given the class label; extremely fast baseline.
- **K-Nearest Neighbors (KNN):** Non-parametric instance-based lazy learner classifying based on feature space proximity.
- **Random Forest:** Ensemble bagging method combining multiple decorrelated decision trees. It consistently achieves the highest **Accuracy and F1 Score ($\approx 88-90\%$)** by mitigating overfitting.

---

### Q10: How are Accuracy, Precision, Recall, and F1 Score defined in the Confusion Matrix?
**Answer:**
Given $\text{TP}$ (True Positives), $\text{TN}$ (True Negatives), $\text{FP}$ (False Positives), and $\text{FN}$ (False Negatives):
- **Accuracy:** $\frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}}$ (Overall correct rate).
- **Precision:** $\frac{\text{TP}}{\text{TP} + \text{FP}}$ (Of all predicted repeat buyers, how many were actually repeat buyers).
- **Recall (Sensitivity):** $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (Of all actual repeat buyers, how many did the model identify).
- **F1 Score:** Harmonic mean of Precision and Recall:
  $$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

---

### Q11: What is Market Basket Analysis and what are Support, Confidence, and Lift?
**Answer:**
Market Basket Analysis finds co-occurrence patterns in customer transactions:
- **Support:** Proportion of transactions containing itemset $X$:
  $$\text{Support}(X) = \frac{\text{Count}(X)}{N}$$
- **Confidence:** Probability that item $Y$ is purchased given that item $X$ was purchased:
  $$\text{Confidence}(X \rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}$$
- **Lift:** Ratio of observed joint support to the expected support if $X$ and $Y$ were independent:
  $$\text{Lift}(X \rightarrow Y) = \frac{\text{Confidence}(X \rightarrow Y)}{\text{Support}(Y)}$$
  - $\text{Lift} = 1$: Independence.
  - $\text{Lift} > 1$: Strong positive complementary association (e.g. Bread $\rightarrow$ Butter has Lift $> 2.0$, meaning customers buying Bread are over 2 times more likely to purchase Butter).

---

### Q12: How does FP-Growth improve upon the Apriori Algorithm?
**Answer:**
- **Apriori** uses a level-wise candidate generation and test approach ($k$-itemsets generated from $(k-1)$-itemsets). It requires repeated multiple full scans of the transaction database, which becomes a bottleneck on large datasets.
- **FP-Growth (Frequent Pattern Growth)** compresses transactions into an in-memory **FP-Tree (Frequent Pattern Tree)** with only two database passes. It mines frequent itemsets directly via conditional FP-trees without generating candidate itemsets, resulting in significant execution speedups (as demonstrated in our benchmark: 0-2 ms vs multi-pass scans).

---

### Q13: How does the Recommendation System generate "You May Also Like" items?
**Answer:**
It uses a **Hybrid Association & Affinity Engine**:
1. When items are in the cart (e.g. *Tea + Biscuits*), it scans the association rule repository for matching antecedents.
2. Identifies consequents (e.g. *Milk, Snacks*) and ranks them by composite confidence and lift scores:
   $$\text{Score} = \text{Confidence} \times \left(1 + \frac{\min(\text{Lift}, 5)}{10}\right)$$
3. If recommendations are fewer than desired, it complements them with popular trending items from the target customer’s most purchased categories.

---

### Q14: What is a Factless Fact Table?
**Answer:**
A factless fact table contains only foreign keys to dimension tables and no numeric additive measures (e.g. tracking student attendance or event registrations). Our `sales_fact` table is a standard **measure-rich fact table** containing both `quantity` and monetary `total_amount`.

---

### Q15: What are Additive, Semi-Additive, and Non-Additive Facts?
**Answer:**
- **Additive Facts:** Can be summed across all dimensions (e.g., `total_amount` and `quantity` in `sales_fact` can be summed across time, store, product, and customer).
- **Semi-Additive Facts:** Can be summed across some dimensions but not others (e.g., account bank balance can be summed across customers, but not across time).
- **Non-Additive Facts:** Cannot be added across any dimension (e.g., unit price or profit margin percentage).

---

## 👨‍💻 Academic Project Contributors
- **Department:** Computer Engineering
- **Academic Year:** Third Year (T.E.)
- **Course Title:** Data Mining & Data Warehousing (DWDM)
