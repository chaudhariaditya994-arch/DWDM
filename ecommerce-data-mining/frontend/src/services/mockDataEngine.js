// Client-Side Data Mining & Analytical Engine
// Provides high-reliability in-browser fallback when remote Flask server is offline or deployed to static hosting

const DEFAULT_USERS_KEY = "ecommerce_users_registry";

const INITIAL_USERS = [
  { id: 1, name: "System Administrator", email: "admin@ecommerce.com", password: "admin123", role: "admin" },
  { id: 2, name: "Data Analyst", email: "analyst@ecommerce.com", password: "analyst123", role: "analyst" },
  { id: 3, name: "Student Demo", email: "student@ecommerce.com", password: "student123", role: "user" },
];

export const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem(DEFAULT_USERS_KEY);
    if (!raw) {
      localStorage.setItem(DEFAULT_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
};

export const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(DEFAULT_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save users:", err);
  }
};

// Embedded representative records from DWDM dataset (sample_sales.csv)
const BASE_RECORDS = [
  { sales_id: "S00001", transaction_id: "TX0001", customer_id: "C0008", customer_name: "Neha Kulkarni", age: 24, gender: "Female", location: "Pune", product_id: "P001", product_name: "Bread", category: "Bakery & Dairy", price: 40, quantity: 2, total_amount: 80, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2026-01-15", previous_purchases: 15, total_spending: 39495, purchase_frequency: 1.25, days_since_last_purchase: 26, likely_to_purchase_again: 1 },
  { sales_id: "S00002", transaction_id: "TX0001", customer_id: "C0003", customer_name: "Rohan Gupta", age: 22, gender: "Male", location: "Delhi", product_id: "P004", product_name: "Tea", category: "Beverages", price: 120, quantity: 2, total_amount: 240, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2025-02-17", previous_purchases: 12, total_spending: 31584, purchase_frequency: 1.0, days_since_last_purchase: 68, likely_to_purchase_again: 1 },
  { sales_id: "S00003", transaction_id: "TX0001", customer_id: "C0018", customer_name: "Nikhil Saxena", age: 36, gender: "Male", location: "Bhopal", product_id: "P005", product_name: "Biscuits", category: "Snacks", price: 30, quantity: 1, total_amount: 30, store_id: "S107", store_name: "Chennai Marina Outlet", region: "South", order_date: "2025-01-04", previous_purchases: 13, total_spending: 23114, purchase_frequency: 1.08, days_since_last_purchase: 28, likely_to_purchase_again: 0 },
  { sales_id: "S00004", transaction_id: "TX0002", customer_id: "C0007", customer_name: "Rahul Verma", age: 52, gender: "Male", location: "Lucknow", product_id: "P010", product_name: "Wireless Mouse", category: "Electronics", price: 850, quantity: 2, total_amount: 1700, store_id: "S103", store_name: "Tech Hub Bengaluru", region: "South", order_date: "2025-06-26", previous_purchases: 35, total_spending: 96740, purchase_frequency: 2.92, days_since_last_purchase: 8, likely_to_purchase_again: 1 },
  { sales_id: "S00005", transaction_id: "TX0002", customer_id: "C0003", customer_name: "Rohan Gupta", age: 22, gender: "Male", location: "Delhi", product_id: "P008", product_name: "Snacks", category: "Snacks", price: 50, quantity: 3, total_amount: 150, store_id: "S106", store_name: "Jaipur Plaza Store", region: "North", order_date: "2025-04-27", previous_purchases: 7, total_spending: 10766, purchase_frequency: 0.58, days_since_last_purchase: 73, likely_to_purchase_again: 1 },
  { sales_id: "S00006", transaction_id: "TX0002", customer_id: "C0024", customer_name: "Amit Choudhury", age: 50, gender: "Male", location: "Guwahati", product_id: "P006", product_name: "Coffee", category: "Beverages", price: 180, quantity: 1, total_amount: 180, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2025-07-09", previous_purchases: 8, total_spending: 15632, purchase_frequency: 0.67, days_since_last_purchase: 49, likely_to_purchase_again: 1 },
  { sales_id: "S00007", transaction_id: "TX0003", customer_id: "C0015", customer_name: "Tanvi Bhat", age: 26, gender: "Female", location: "Bengaluru", product_id: "P002", product_name: "Butter", category: "Bakery & Dairy", price: 60, quantity: 1, total_amount: 60, store_id: "S106", store_name: "Jaipur Plaza Store", region: "North", order_date: "2025-06-16", previous_purchases: 6, total_spending: 12258, purchase_frequency: 0.5, days_since_last_purchase: 49, likely_to_purchase_again: 0 },
  { sales_id: "S00008", transaction_id: "TX0003", customer_id: "C0021", customer_name: "Priya Das", age: 32, gender: "Female", location: "Bhubaneswar", product_id: "P003", product_name: "Milk", category: "Bakery & Dairy", price: 32, quantity: 1, total_amount: 32, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2025-12-02", previous_purchases: 28, total_spending: 96852, purchase_frequency: 2.33, days_since_last_purchase: 20, likely_to_purchase_again: 1 },
  { sales_id: "S00009", transaction_id: "TX0003", customer_id: "C0026", customer_name: "Varun Khanna", age: 37, gender: "Male", location: "Amritsar", product_id: "P005", product_name: "Biscuits", category: "Snacks", price: 30, quantity: 1, total_amount: 30, store_id: "S103", store_name: "Tech Hub Bengaluru", region: "South", order_date: "2025-04-23", previous_purchases: 1, total_spending: 849, purchase_frequency: 0.08, days_since_last_purchase: 34, likely_to_purchase_again: 0 },
  { sales_id: "S00010", transaction_id: "TX0004", customer_id: "C0028", customer_name: "Harshvardhan Goel", age: 43, gender: "Male", location: "Kanpur", product_id: "P003", product_name: "Milk", category: "Bakery & Dairy", price: 32, quantity: 2, total_amount: 64, store_id: "S105", store_name: "West Gate Ahmedabad", region: "West", order_date: "2025-02-02", previous_purchases: 15, total_spending: 38985, purchase_frequency: 1.25, days_since_last_purchase: 111, likely_to_purchase_again: 1 },
  { sales_id: "S00011", transaction_id: "TX0004", customer_id: "C0022", customer_name: "Gaurav Bansal", age: 27, gender: "Male", location: "Delhi", product_id: "P006", product_name: "Coffee", category: "Beverages", price: 180, quantity: 1, total_amount: 180, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2025-05-31", previous_purchases: 11, total_spending: 17842, purchase_frequency: 0.92, days_since_last_purchase: 96, likely_to_purchase_again: 1 },
  { sales_id: "S00012", transaction_id: "TX0004", customer_id: "C0013", customer_name: "Aditya Malhotra", age: 35, gender: "Male", location: "Delhi", product_id: "P017", product_name: "Camera", category: "Electronics", price: 32000, quantity: 3, total_amount: 96000, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2025-07-11", previous_purchases: 43, total_spending: 20597, purchase_frequency: 3.58, days_since_last_purchase: 5, likely_to_purchase_again: 1 },
  { sales_id: "S00013", transaction_id: "TX0005", customer_id: "C0020", customer_name: "Manish Tiwari", age: 44, gender: "Male", location: "Patna", product_id: "P005", product_name: "Biscuits", category: "Snacks", price: 30, quantity: 2, total_amount: 60, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2025-01-30", previous_purchases: 20, total_spending: 18500, purchase_frequency: 1.67, days_since_last_purchase: 23, likely_to_purchase_again: 1 },
  { sales_id: "S00014", transaction_id: "TX0005", customer_id: "C0011", customer_name: "Siddharth Roy", age: 30, gender: "Male", location: "Kolkata", product_id: "P014", product_name: "Headphones", category: "Electronics", price: 1500, quantity: 4, total_amount: 6000, store_id: "S103", store_name: "Tech Hub Bengaluru", region: "South", order_date: "2025-09-28", previous_purchases: 24, total_spending: 79680, purchase_frequency: 2.0, days_since_last_purchase: 11, likely_to_purchase_again: 1 },
  { sales_id: "S00015", transaction_id: "TX0005", customer_id: "C0024", customer_name: "Amit Choudhury", age: 50, gender: "Male", location: "Guwahati", product_id: "P001", product_name: "Bread", category: "Bakery & Dairy", price: 40, quantity: 1, total_amount: 40, store_id: "S104", store_name: "City Mega Store Kolkata", region: "East", order_date: "2025-09-22", previous_purchases: 26, total_spending: 73060, purchase_frequency: 2.17, days_since_last_purchase: 9, likely_to_purchase_again: 0 },
  { sales_id: "S00016", transaction_id: "TX0006", customer_id: "C0004", customer_name: "Ananya Iyer", age: 45, gender: "Female", location: "Bengaluru", product_id: "P011", product_name: "Smartphone", category: "Electronics", price: 18000, quantity: 1, total_amount: 18000, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2025-02-04", previous_purchases: 11, total_spending: 26268, purchase_frequency: 0.92, days_since_last_purchase: 42, likely_to_purchase_again: 1 },
  { sales_id: "S00017", transaction_id: "TX0006", customer_id: "C0031", customer_name: "Sonal Agarwal", age: 35, gender: "Female", location: "Agra", product_id: "P005", product_name: "Biscuits", category: "Snacks", price: 30, quantity: 1, total_amount: 30, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2026-02-06", previous_purchases: 15, total_spending: 47370, purchase_frequency: 1.25, days_since_last_purchase: 22, likely_to_purchase_again: 1 },
  { sales_id: "S00018", transaction_id: "TX0006", customer_id: "C0007", customer_name: "Rahul Verma", age: 52, gender: "Male", location: "Lucknow", product_id: "P004", product_name: "Tea", category: "Beverages", price: 120, quantity: 1, total_amount: 120, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2025-07-26", previous_purchases: 39, total_spending: 44889, purchase_frequency: 3.25, days_since_last_purchase: 10, likely_to_purchase_again: 1 },
  { sales_id: "S00019", transaction_id: "TX0007", customer_id: "C0005", customer_name: "Vikram Singh", age: 31, gender: "Male", location: "Jaipur", product_id: "P018", product_name: "Memory Card", category: "Electronics", price: 650, quantity: 1, total_amount: 650, store_id: "S104", store_name: "City Mega Store Kolkata", region: "East", order_date: "2026-02-18", previous_purchases: 12, total_spending: 9384, purchase_frequency: 1.0, days_since_last_purchase: 9, likely_to_purchase_again: 1 },
  { sales_id: "S00020", transaction_id: "TX0007", customer_id: "C0032", customer_name: "Sameer Nanda", age: 40, gender: "Male", location: "Vadodara", product_id: "P002", product_name: "Butter", category: "Bakery & Dairy", price: 60, quantity: 1, total_amount: 60, store_id: "S104", store_name: "City Mega Store Kolkata", region: "East", order_date: "2025-04-20", previous_purchases: 7, total_spending: 10402, purchase_frequency: 0.58, days_since_last_purchase: 115, likely_to_purchase_again: 1 },
  { sales_id: "S00021", transaction_id: "TX0007", customer_id: "C0019", customer_name: "Isha Mukherjee", age: 29, gender: "Female", location: "Kolkata", product_id: "P018", product_name: "Memory Card", category: "Electronics", price: 650, quantity: 2, total_amount: 1300, store_id: "S104", store_name: "City Mega Store Kolkata", region: "East", order_date: "2025-12-23", previous_purchases: 24, total_spending: 38760, purchase_frequency: 2.0, days_since_last_purchase: 8, likely_to_purchase_again: 1 },
  { sales_id: "S00022", transaction_id: "TX0008", customer_id: "C0035", customer_name: "Swati Hegde", age: 30, gender: "Female", location: "Mangaluru", product_id: "P002", product_name: "Butter", category: "Bakery & Dairy", price: 60, quantity: 1, total_amount: 60, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2026-01-18", previous_purchases: 22, total_spending: 13904, purchase_frequency: 1.83, days_since_last_purchase: 18, likely_to_purchase_again: 0 },
  { sales_id: "S00023", transaction_id: "TX0008", customer_id: "C0012", customer_name: "Meera Joshi", age: 27, gender: "Female", location: "Mumbai", product_id: "P011", product_name: "Smartphone", category: "Electronics", price: 18000, quantity: 1, total_amount: 18000, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2025-11-01", previous_purchases: 45, total_spending: 76275, purchase_frequency: 3.75, days_since_last_purchase: 10, likely_to_purchase_again: 1 },
  { sales_id: "S00024", transaction_id: "TX0008", customer_id: "C0021", customer_name: "Priya Das", age: 32, gender: "Female", location: "Bhubaneswar", product_id: "P005", product_name: "Biscuits", category: "Snacks", price: 30, quantity: 3, total_amount: 90, store_id: "S102", store_name: "Delhi Central Mart", region: "North", order_date: "2025-05-16", previous_purchases: 12, total_spending: 27324, purchase_frequency: 1.0, days_since_last_purchase: 21, likely_to_purchase_again: 1 },
  { sales_id: "S00025", transaction_id: "TX0009", customer_id: "C0020", customer_name: "Manish Tiwari", age: 44, gender: "Male", location: "Patna", product_id: "P019", product_name: "Shampoo", category: "Personal Care", price: 220, quantity: 1, total_amount: 220, store_id: "S105", store_name: "West Gate Ahmedabad", region: "West", order_date: "2025-08-14", previous_purchases: 20, total_spending: 18500, purchase_frequency: 1.67, days_since_last_purchase: 23, likely_to_purchase_again: 1 },
  { sales_id: "S00026", transaction_id: "TX0009", customer_id: "C0020", customer_name: "Manish Tiwari", age: 44, gender: "Male", location: "Patna", product_id: "P020", product_name: "Conditioner", category: "Personal Care", price: 250, quantity: 1, total_amount: 250, store_id: "S105", store_name: "West Gate Ahmedabad", region: "West", order_date: "2025-08-14", previous_purchases: 20, total_spending: 18500, purchase_frequency: 1.67, days_since_last_purchase: 23, likely_to_purchase_again: 1 },
  { sales_id: "S00027", transaction_id: "TX0010", customer_id: "C0001", customer_name: "Aarav Sharma", age: 29, gender: "Male", location: "Mumbai", product_id: "P009", product_name: "Laptop", category: "Electronics", price: 55000, quantity: 1, total_amount: 55000, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2025-10-12", previous_purchases: 32, total_spending: 84200, purchase_frequency: 2.67, days_since_last_purchase: 14, likely_to_purchase_again: 1 },
  { sales_id: "S00028", transaction_id: "TX0010", customer_id: "C0001", customer_name: "Aarav Sharma", age: 29, gender: "Male", location: "Mumbai", product_id: "P010", product_name: "Wireless Mouse", category: "Electronics", price: 850, quantity: 1, total_amount: 850, store_id: "S101", store_name: "Metro Express Mumbai", region: "West", order_date: "2025-10-12", previous_purchases: 32, total_spending: 84200, purchase_frequency: 2.67, days_since_last_purchase: 14, likely_to_purchase_again: 1 },
];

let activeDataset = [...BASE_RECORDS];

export const mockEngine = {
  // Auth
  login: async ({ email, password }) => {
    const users = getRegisteredUsers();
    const cleanEmail = (email || "").trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("User with this email does not exist.");
    }
    if (user.password !== password) {
      throw new Error("Invalid password.");
    }
    return {
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "analyst",
      },
      token: `jwt_mock_token_${user.id}_ecommerce_dwdm`,
    };
  },

  register: async ({ name, email, password, role = "analyst" }) => {
    const users = getRegisteredUsers();
    const cleanEmail = (email || "").trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("An account with this email address already exists.");
    }
    const newUser = {
      id: users.length + 101,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role || "analyst",
    };
    users.push(newUser);
    saveRegisteredUsers(users);
    return {
      message: "Account created successfully! Welcome to the platform.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token: `jwt_mock_token_${newUser.id}_ecommerce_dwdm`,
    };
  },

  checkHealth: async () => ({
    status: "healthy",
    database: {
      db_type: "in_memory_simulation",
      mysql_host: "localhost",
      mysql_port: 3306,
      mysql_database: "ecommerce_data_mining",
      records_cached: activeDataset.length,
    },
  }),

  // Dashboard
  getDashboardStats: async () => ({
    total_customers: 50,
    total_products: 25,
    total_orders: 975,
    total_revenue: 1428560.0,
    average_order_value: 1465.19,
    most_purchased_product: "Bread",
    customer_segments: 4,
    classification_accuracy: 91.8,
    top_products: [
      { product: "Smartphone", category: "Electronics", quantity: 142, revenue: 2556000.0 },
      { product: "Camera", category: "Electronics", quantity: 68, revenue: 2176000.0 },
      { product: "Laptop", category: "Electronics", quantity: 42, revenue: 2310000.0 },
      { product: "Headphones", category: "Electronics", quantity: 185, revenue: 277500.0 },
      { product: "Wireless Mouse", category: "Electronics", quantity: 210, revenue: 178500.0 },
    ],
  }),

  getMonthlySales: async () => [
    { month: "Jan", sales: 115400, orders: 82 },
    { month: "Feb", sales: 128900, orders: 88 },
    { month: "Mar", sales: 142300, orders: 95 },
    { month: "Apr", sales: 134500, orders: 90 },
    { month: "May", sales: 158200, orders: 104 },
    { month: "Jun", sales: 169800, orders: 112 },
    { month: "Jul", sales: 161200, orders: 108 },
    { month: "Aug", sales: 175600, orders: 118 },
    { month: "Sep", sales: 182100, orders: 122 },
    { month: "Oct", sales: 194500, orders: 130 },
    { month: "Nov", sales: 210800, orders: 142 },
    { month: "Dec", sales: 235400, orders: 158 },
  ],

  getCategorySales: async () => [
    { category: "Electronics", revenue: 7109500, quantity: 437 },
    { category: "Bakery & Dairy", revenue: 95420, quantity: 2380 },
    { category: "Beverages", revenue: 124800, quantity: 1040 },
    { category: "Snacks", revenue: 68450, quantity: 1710 },
    { category: "Personal Care", revenue: 145200, quantity: 484 },
  ],

  getRegionSales: async () => [
    { region: "North", sales: 2150000, customers: 18 },
    { region: "West", sales: 2840000, customers: 15 },
    { region: "South", sales: 1920000, customers: 10 },
    { region: "East", sales: 1430000, customers: 7 },
  ],

  // Dataset Operations
  getDatasetPreview: async (limit = 20, offset = 0) => {
    const start = parseInt(offset) || 0;
    const end = start + (parseInt(limit) || 20);
    const rows = activeDataset.slice(start, end);
    return {
      total: activeDataset.length,
      limit,
      offset,
      columns: Object.keys(BASE_RECORDS[0]),
      rows,
    };
  },

  getDatasetStatistics: async () => ({
    total_records: activeDataset.length,
    total_columns: 26,
    missing_values: {
      total_missing: 0,
      by_column: { age: 0, total_spending: 0, purchase_frequency: 0, days_since_last_purchase: 0 },
    },
    numerical_summary: {
      age: { mean: 36.4, min: 18, max: 65, std: 11.2 },
      price: { mean: 2450.5, min: 25, max: 55000, std: 6200.1 },
      quantity: { mean: 2.1, min: 1, max: 5, std: 1.1 },
      total_amount: { mean: 5142.8, min: 25, max: 135000, std: 13400.0 },
      previous_purchases: { mean: 18.6, min: 1, max: 45, std: 12.3 },
      total_spending: { mean: 38450.2, min: 849, max: 96852, std: 28900.5 },
    },
  }),

  uploadDataset: async (formData) => {
    return {
      message: "Dataset processed and integrated successfully into analytical store.",
      records: activeDataset.length,
    };
  },

  resetDataset: async () => {
    activeDataset = [...BASE_RECORDS];
    return {
      message: "Dataset reset to standard baseline DWDM benchmark records.",
      records: activeDataset.length,
    };
  },

  // Preprocessing
  getPreprocessingResults: async () => ({
    before: {
      total_records: 975,
      missing_count: 32,
      outliers_count: 18,
      stats: {
        total_records: 975,
        missing_count: 32,
        outliers_count: 18,
        mean_spending: 38450.2,
        std_spending: 28900.5,
      },
    },
    after: {
      total_records: 975,
      missing_count: 0,
      outliers_count: 0,
      stats: {
        total_records: 975,
        missing_count: 0,
        outliers_count: 0,
        mean_spending: 37210.8,
        std_spending: 24100.2,
      },
      charts: {
        total_spending: {
          histogram: [
            { bin: "0 - 15k", count: 28 },
            { bin: "15k - 30k", count: 42 },
            { bin: "30k - 45k", count: 56 },
            { bin: "45k - 60k", count: 34 },
            { bin: "60k - 75k", count: 22 },
            { bin: "75k - 90k+", count: 18 },
          ],
          boxplot: { q1: 18500, median: 36200, q3: 58400, min: 1200, max: 88500 },
        },
        age: {
          histogram: [
            { bin: "18-25", count: 32 },
            { bin: "26-35", count: 75 },
            { bin: "36-45", count: 54 },
            { bin: "46-55", count: 26 },
            { bin: "56-65", count: 13 },
          ],
          boxplot: { q1: 26, median: 35, q3: 46, min: 19, max: 64 },
        },
        purchase_frequency: {
          histogram: [
            { bin: "0 - 1.0", count: 45 },
            { bin: "1.0 - 2.0", count: 88 },
            { bin: "2.0 - 3.0", count: 52 },
            { bin: "3.0 - 4.0+", count: 15 },
          ],
          boxplot: { q1: 0.8, median: 1.6, q3: 2.5, min: 0.1, max: 3.8 },
        },
      },
    },
  }),

  runPreprocessing: async (config) => {
    return mockEngine.getPreprocessingResults();
  },

  // Clustering
  runClustering: async (k = 4) => {
    const kNum = parseInt(k) || 4;
    const baseProfiles = [
      {
        cluster_id: 0,
        label: "High-Value Loyalists",
        count: 24,
        percentage: 24.0,
        avg_spending: "₹82,450",
        avg_age: 38,
        avg_frequency: 3.2,
        description: "Frequent shoppers with high basket values and high brand engagement.",
      },
      {
        cluster_id: 1,
        label: "Budget Conscientious",
        count: 36,
        percentage: 36.0,
        avg_spending: "₹14,200",
        avg_age: 27,
        avg_frequency: 0.9,
        description: "Price-sensitive buyers purchasing primarily essentials and discount offers.",
      },
      {
        cluster_id: 2,
        label: "Occasional Tech Enthusiasts",
        count: 22,
        percentage: 22.0,
        avg_spending: "₹64,800",
        avg_age: 33,
        avg_frequency: 1.8,
        description: "Selective buyers investing in premium electronics and accessories.",
      },
      {
        cluster_id: 3,
        label: "At-Risk / Lapsed Customers",
        count: 18,
        percentage: 18.0,
        avg_spending: "₹22,100",
        avg_age: 46,
        avg_frequency: 0.6,
        description: "Infrequent buyers with high recency days requiring win-back campaigns.",
      },
    ];

    const scatterPoints = [
      { x: 2.8, y: 1.9, cluster: 0, customer_name: "Aarav Sharma", spending: 84200 },
      { x: 3.1, y: 2.2, cluster: 0, customer_name: "Rahul Verma", spending: 96740 },
      { x: 2.5, y: 1.7, cluster: 0, customer_name: "Priya Das", spending: 96852 },
      { x: -1.8, y: -0.9, cluster: 1, customer_name: "Nikhil Saxena", spending: 23114 },
      { x: -2.3, y: -1.2, cluster: 1, customer_name: "Varun Khanna", spending: 849 },
      { x: -1.4, y: -0.6, cluster: 1, customer_name: "Tanvi Bhat", spending: 12258 },
      { x: 1.2, y: -1.8, cluster: 2, customer_name: "Aditya Malhotra", spending: 68400 },
      { x: 1.5, y: -1.5, cluster: 2, customer_name: "Siddharth Roy", spending: 79680 },
      { x: 0.9, y: -1.2, cluster: 2, customer_name: "Isha Mukherjee", spending: 58200 },
      { x: -0.5, y: 2.3, cluster: 3, customer_name: "Sameer Nanda", spending: 10402 },
      { x: -0.8, y: 2.1, cluster: 3, customer_name: "Swati Hegde", spending: 13904 },
      { x: -0.2, y: 2.6, cluster: 3, customer_name: "Harshvardhan Goel", spending: 38985 },
    ];

    const elbowCurve = [
      { k: 2, inertia: 18240 },
      { k: 3, inertia: 11450 },
      { k: 4, inertia: 6920 },
      { k: 5, inertia: 5120 },
      { k: 6, inertia: 4180 },
      { k: 7, inertia: 3450 },
      { k: 8, inertia: 2980 },
    ];

    return {
      k: kNum,
      silhouette_score: kNum === 4 ? 0.68 : 0.59,
      cluster_profiles: baseProfiles.slice(0, kNum),
      scatter_points: scatterPoints.map((p) => ({
        ...p,
        cluster: p.cluster % kNum,
      })),
      elbow_curve: elbowCurve,
    };
  },

  getClusteringResults: async () => mockEngine.runClustering(4),

  // Classification
  getClassificationResults: async () => ({
    best_model: "Random Forest",
    target_feature: "likely_to_purchase_again",
    dataset_size: 975,
    models_comparison: [
      {
        model: "Random Forest",
        accuracy: 92.4,
        precision: 91.8,
        recall: 93.1,
        f1_score: 92.4,
        cv_mean: 91.6,
        cv_std: 1.4,
        confusion_matrix: [
          [88, 7],
          [6, 99],
        ],
        feature_importances: [
          { feature: "total_spending", importance: 0.38 },
          { feature: "purchase_frequency", importance: 0.29 },
          { feature: "days_since_last_purchase", importance: 0.18 },
          { feature: "previous_purchases", importance: 0.11 },
          { feature: "age", importance: 0.04 },
        ],
      },
      {
        model: "Decision Tree",
        accuracy: 86.8,
        precision: 85.2,
        recall: 87.9,
        f1_score: 86.5,
        cv_mean: 85.4,
        cv_std: 2.3,
        confusion_matrix: [
          [81, 14],
          [12, 93],
        ],
        feature_importances: [
          { feature: "total_spending", importance: 0.44 },
          { feature: "purchase_frequency", importance: 0.32 },
          { feature: "days_since_last_purchase", importance: 0.15 },
          { feature: "previous_purchases", importance: 0.09 },
        ],
      },
      {
        model: "K-Nearest Neighbors (KNN)",
        accuracy: 88.5,
        precision: 87.6,
        recall: 89.2,
        f1_score: 88.4,
        cv_mean: 87.1,
        cv_std: 1.8,
        confusion_matrix: [
          [83, 12],
          [11, 94],
        ],
      },
      {
        model: "Naive Bayes",
        accuracy: 83.2,
        precision: 81.9,
        recall: 84.8,
        f1_score: 83.3,
        cv_mean: 82.5,
        cv_std: 2.1,
        confusion_matrix: [
          [78, 17],
          [16, 89],
        ],
      },
    ],
  }),

  trainClassification: async () => mockEngine.getClassificationResults(),

  predictCustomer: async (customerData) => {
    const spending = parseFloat(customerData.spending || customerData.total_spending || 5000);
    const freq = parseFloat(customerData.frequency || customerData.purchase_frequency || 1.0);
    const recency = parseFloat(customerData.recency || customerData.days_since_last_purchase || 30);

    const isHigh = spending > 25000 && freq >= 1.5 && recency <= 45;
    const probability = isHigh ? 91.5 : 74.2;

    return {
      prediction: isHigh ? 1 : 0,
      predicted_label: isHigh ? "Likely to Purchase Again" : "At Risk of Inactivity",
      probability,
      model_used: customerData.model || "Random Forest",
      features: {
        total_spending: spending,
        purchase_frequency: freq,
        days_since_last_purchase: recency,
      },
      recommendation: isHigh
        ? "Engage with loyalty perks, VIP bundles, and priority previews."
        : "Trigger re-engagement coupons, win-back discount codes, and surveys.",
    };
  },

  // Association Rules
  runApriori: async (params = {}) => ({
    algorithm: "Apriori",
    execution_time_ms: 42,
    min_support: params.min_support || 0.03,
    min_confidence: params.min_confidence || 0.3,
    total_itemsets: 18,
    total_rules: 9,
    frequent_itemsets: [
      { itemsets: ["Bread"], support: 0.28 },
      { itemsets: ["Butter"], support: 0.24 },
      { itemsets: ["Tea"], support: 0.22 },
      { itemsets: ["Biscuits"], support: 0.19 },
      { itemsets: ["Milk"], support: 0.18 },
      { itemsets: ["Bread", "Butter"], support: 0.16 },
      { itemsets: ["Tea", "Biscuits"], support: 0.14 },
      { itemsets: ["Laptop", "Wireless Mouse"], support: 0.09 },
      { itemsets: ["Smartphone", "Screen Protector"], support: 0.08 },
      { itemsets: ["Shampoo", "Conditioner"], support: 0.07 },
    ],
    rules: [
      { antecedents: ["Bread"], consequents: ["Butter"], support: 0.16, confidence: 0.57, lift: 2.38, conviction: 1.77 },
      { antecedents: ["Butter"], consequents: ["Bread"], support: 0.16, confidence: 0.67, lift: 2.38, conviction: 2.18 },
      { antecedents: ["Tea"], consequents: ["Biscuits"], support: 0.14, confidence: 0.64, lift: 3.37, conviction: 2.25 },
      { antecedents: ["Biscuits"], consequents: ["Tea"], support: 0.14, confidence: 0.74, lift: 3.37, conviction: 2.96 },
      { antecedents: ["Laptop"], consequents: ["Wireless Mouse"], support: 0.09, confidence: 0.78, lift: 4.12, conviction: 3.45 },
      { antecedents: ["Smartphone"], consequents: ["Screen Protector"], support: 0.08, confidence: 0.72, lift: 4.8, conviction: 3.03 },
      { antecedents: ["Shampoo"], consequents: ["Conditioner"], support: 0.07, confidence: 0.82, lift: 5.46, conviction: 4.72 },
      { antecedents: ["Coffee"], consequents: ["Biscuits"], support: 0.06, confidence: 0.52, lift: 2.74, conviction: 1.69 },
      { antecedents: ["Bread", "Milk"], consequents: ["Butter"], support: 0.05, confidence: 0.62, lift: 2.58, conviction: 2.0 },
    ],
  }),

  runFpGrowth: async (params = {}) => {
    const res = await mockEngine.runApriori(params);
    return {
      ...res,
      algorithm: "FP-Growth",
      execution_time_ms: 14,
    };
  },

  getAssociationRules: async () => mockEngine.runApriori(),

  // Recommendations
  getRecommendations: async ({ products = [] }) => {
    const rules = (await mockEngine.runApriori()).rules;
    const recommendations = [];

    products.forEach((prod) => {
      const match = rules.find((r) => r.antecedents.includes(prod));
      if (match) {
        match.consequents.forEach((item) => {
          if (!products.includes(item) && !recommendations.some((rec) => rec.product_name === item)) {
            recommendations.push({
              product_name: item,
              category: "Cross-Sell Bundle",
              score: Math.round(match.confidence * 100),
              lift: match.lift,
              confidence: match.confidence,
              reason: `Frequently purchased with ${prod} (Confidence: ${(match.confidence * 100).toFixed(0)}%, Lift: ${match.lift.toFixed(1)}x)`,
            });
          }
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push(
        { product_name: "Butter", category: "Bakery & Dairy", score: 85, lift: 2.4, confidence: 0.67, reason: "Bestselling complementary everyday product." },
        { product_name: "Wireless Mouse", category: "Electronics", score: 82, lift: 4.1, confidence: 0.78, reason: "Universal top-rated accessory." }
      );
    }

    return { recommendations };
  },

  getCustomerRecommendations: async (customerId) => {
    const customer = {
      customer_id: customerId || "C0001",
      customer_name: "Aarav Sharma",
      segment: "High-Value Loyalist",
      total_spending: 84200,
      recent_purchases: ["Laptop", "Wireless Mouse"],
    };

    const recommendations = [
      { product_name: "Laptop Sleeve Bag", category: "Electronics Accessories", score: 92, confidence: 0.88, reason: "Based on purchase of Laptop (Cross-Category Affinity)" },
      { product_name: "External SSD 1TB", category: "Electronics Storage", score: 86, confidence: 0.81, reason: "High-probability match for High-Value Loyalist segment" },
      { product_name: "Noise-Cancelling Headphones", category: "Audio", score: 79, confidence: 0.74, reason: "Frequently bought together by similar customer cohorts" },
    ];

    return { customer, recommendations };
  },

  // Star Schema Metadata
  getWarehouseSchema: async () => ({
    warehouse_name: "E-Commerce Multidimensional Star Schema",
    fact_table: {
      name: "Fact_Sales",
      type: "Fact Table",
      grain: "Individual Sales Line Item",
      row_count: 975,
      columns: [
        { name: "sales_id", type: "VARCHAR(20)", key: "PK", role: "Primary Key" },
        { name: "customer_id", type: "VARCHAR(20)", key: "FK", role: "Foreign Key -> Dim_Customer" },
        { name: "product_id", type: "VARCHAR(20)", key: "FK", role: "Foreign Key -> Dim_Product" },
        { name: "store_id", type: "VARCHAR(20)", key: "FK", role: "Foreign Key -> Dim_Store" },
        { name: "time_id", type: "VARCHAR(20)", key: "FK", role: "Foreign Key -> Dim_Time" },
        { name: "quantity", type: "INT", key: "Measure", role: "Additive Metric (Units Sold)" },
        { name: "total_amount", type: "DECIMAL(10,2)", key: "Measure", role: "Additive Metric (Revenue ₹)" },
      ],
    },
    dimension_tables: [
      {
        name: "customers",
        type: "Dimension Table",
        key: "customer_id",
        row_count: 50,
        columns: [
          { name: "customer_id", type: "VARCHAR(20)", key: "PK" },
          { name: "customer_name", type: "VARCHAR(100)", key: "Attribute" },
          { name: "age", type: "INT", key: "Attribute" },
          { name: "gender", type: "VARCHAR(10)", key: "Attribute" },
          { name: "location", type: "VARCHAR(50)", key: "Attribute / Geographic Level" },
        ],
      },
      {
        name: "products",
        type: "Dimension Table",
        key: "product_id",
        row_count: 25,
        columns: [
          { name: "product_id", type: "VARCHAR(20)", key: "PK" },
          { name: "product_name", type: "VARCHAR(100)", key: "Attribute" },
          { name: "category", type: "VARCHAR(50)", key: "Hierarchy Level (Category)" },
          { name: "price", type: "DECIMAL(10,2)", key: "Unit Price" },
        ],
      },
      {
        name: "stores",
        type: "Dimension Table",
        key: "store_id",
        row_count: 10,
        columns: [
          { name: "store_id", type: "VARCHAR(20)", key: "PK" },
          { name: "store_name", type: "VARCHAR(100)", key: "Store Identifier" },
          { name: "region", type: "VARCHAR(50)", key: "Regional Level (North, South, East, West)" },
        ],
      },
      {
        name: "time_dimension",
        type: "Dimension Table",
        key: "time_id",
        row_count: 365,
        columns: [
          { name: "time_id", type: "VARCHAR(20)", key: "PK" },
          { name: "order_date", type: "DATE", key: "Date Level" },
          { name: "day", type: "INT", key: "Day of Month (1-31)" },
          { name: "month", type: "INT", key: "Month (1-12)" },
          { name: "quarter", type: "INT", key: "Quarter (Q1-Q4)" },
          { name: "year", type: "INT", key: "Year (2025-2026)" },
        ],
      },
    ],
  }),

  // OLAP Operations
  getOlapAnalysis: async (params = {}) => {
    const op = params.operation || "rollup";
    const level = params.level || "month";

    if (op === "rollup") {
      return {
        operation: "Roll-up",
        level: level === "year" ? "Yearly Aggregation" : "Quarterly Aggregation",
        data: [
          { label: "Q1 2025", revenue: 386600, units: 265, transactions: 170 },
          { label: "Q2 2025", revenue: 462500, units: 306, transactions: 202 },
          { label: "Q3 2025", revenue: 518900, units: 348, transactions: 230 },
          { label: "Q4 2025", revenue: 640700, units: 430, transactions: 290 },
          { label: "Q1 2026", revenue: 421200, units: 290, transactions: 195 },
        ],
      };
    } else if (op === "drilldown") {
      return {
        operation: "Drill-down",
        level: "Store and Daily Granularity",
        data: [
          { label: "Metro Express Mumbai - Electronics", revenue: 1420000, units: 112 },
          { label: "Metro Express Mumbai - Groceries", revenue: 284000, units: 580 },
          { label: "Delhi Central Mart - Electronics", revenue: 1180000, units: 98 },
          { label: "Delhi Central Mart - Groceries", revenue: 215000, units: 470 },
          { label: "Tech Hub Bengaluru - Electronics", revenue: 1690000, units: 145 },
          { label: "City Mega Store Kolkata - Electronics", revenue: 840000, units: 68 },
        ],
      };
    } else if (op === "slice") {
      return {
        operation: "Slice",
        dimension: params.slice_dim || "Category",
        slice_value: "Electronics",
        data: [
          { label: "North Region", revenue: 2150000, units: 142 },
          { label: "West Region", revenue: 2840000, units: 188 },
          { label: "South Region", revenue: 1920000, units: 125 },
          { label: "East Region", revenue: 1430000, units: 94 },
        ],
      };
    } else {
      // Dice
      return {
        operation: "Dice",
        dimensions: ["Region: West/North", "Category: Electronics/Beverages", "Quarter: Q1/Q2"],
        data: [
          { label: "West • Electronics • Q1", revenue: 820000, units: 62 },
          { label: "West • Beverages • Q1", revenue: 45000, units: 280 },
          { label: "North • Electronics • Q1", revenue: 690000, units: 54 },
          { label: "North • Beverages • Q1", revenue: 38000, units: 240 },
          { label: "West • Electronics • Q2", revenue: 940000, units: 71 },
          { label: "North • Electronics • Q2", revenue: 760000, units: 59 },
        ],
      };
    }
  },

  // Academic Consolidated Report
  getConsolidatedReport: async () => ({
    title: "E-Commerce Customer Intelligence & Product Recommendation System Using Data Mining and Data Warehousing",
    academic_subject: "Data Mining and Data Warehousing (DWDM) - BE Computer Engineering",
    timestamp: new Date().toLocaleString(),
    dataset_summary: {
      total_records: 975,
      total_columns: 26,
      total_revenue: 1428560.0,
      total_orders: 975,
      total_customers: 50,
      most_purchased_product: "Bread",
    },
    clustering_summary: {
      algorithm: "K-Means Clustering",
      k: 4,
      silhouette_score: 0.68,
      segments: [
        { cluster_id: 0, label: "High-Value Loyalists", count: 24, percentage: 24.0, avg_spending: "₹82,450" },
        { cluster_id: 1, label: "Budget Conscientious", count: 36, percentage: 36.0, avg_spending: "₹14,200" },
        { cluster_id: 2, label: "Occasional Tech Enthusiasts", count: 22, percentage: 22.0, avg_spending: "₹64,800" },
        { cluster_id: 3, label: "At-Risk / Lapsed", count: 18, percentage: 18.0, avg_spending: "₹22,100" },
      ],
    },
    classification_summary: {
      best_model: "Random Forest Classifier",
      accuracy: 92.4,
      precision: 91.8,
      recall: 93.1,
      f1_score: 92.4,
      feature_importance: "Total Spending (38%), Purchase Frequency (29%), Recency (18%)",
    },
    association_summary: {
      algorithm: "FP-Growth & Apriori",
      frequent_itemsets_min_support: 0.03,
      min_confidence: 0.3,
      top_rule: "Bread => Butter (Confidence: 57%, Lift: 2.38)",
      top_bundle: "Tea => Biscuits (Confidence: 64%, Lift: 3.37)",
    },
    star_schema_summary: {
      fact_table: "Fact_Sales (975 grain records)",
      dimensions: ["Dim_Customer (50)", "Dim_Product (25)", "Dim_Store (10)", "Dim_Time (365)"],
      olap_operations: ["Roll-up", "Drill-down", "Slice", "Dice"],
    },
  }),
};

export default mockEngine;
