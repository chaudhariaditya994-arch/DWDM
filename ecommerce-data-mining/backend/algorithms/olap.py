import pandas as pd

def run_olap_analysis(df, operation="rollup", level="month", filters=None):
    """
    Executes OLAP Operations on Sales Data:
    - Roll-up: Day -> Month -> Quarter -> Year (aggregating sales metrics)
    - Drill-down: Year -> Quarter -> Month -> Day (detailed granular sales)
    - Slice: Single dimension filter (e.g. category = 'Electronics' or region = 'North')
    - Dice: Multi-dimensional sub-cube (e.g. region + category + year combination)
    """
    data = df.copy()
    if filters:
        for k, v in filters.items():
            if k in data.columns and v:
                if isinstance(v, list):
                    data = data[data[k].isin(v)]
                else:
                    data = data[data[k] == v]

    # Clean total_amount
    data["total_amount"] = pd.to_numeric(data["total_amount"], errors="coerce").fillna(0)
    data["quantity"] = pd.to_numeric(data["quantity"], errors="coerce").fillna(1)

    result = {}

    if operation == "rollup":
        # Group by Time hierarchy or Location hierarchy
        group_col = "year" if level == "year" else "quarter" if level == "quarter" else "month"
        agg = data.groupby(group_col).agg(
            total_revenue=("total_amount", "sum"),
            total_orders=("quantity", "sum"),
            avg_order_value=("total_amount", "mean"),
            unique_customers=("customer_id", "nunique")
        ).reset_index()
        agg["total_revenue"] = agg["total_revenue"].round(2)
        agg["avg_order_value"] = agg["avg_order_value"].round(2)
        result["data"] = agg.to_dict(orient="records")
        result["hierarchy"] = f"Rolled-up to level: {level.capitalize()}"

    elif operation == "drilldown":
        # Detailed granular level
        drill_col = "order_date" if level == "day" else "month" if level == "month" else "quarter"
        agg = data.groupby(drill_col).agg(
            total_revenue=("total_amount", "sum"),
            total_orders=("quantity", "sum"),
            avg_order_value=("total_amount", "mean")
        ).reset_index().head(30)
        agg["total_revenue"] = agg["total_revenue"].round(2)
        agg["avg_order_value"] = agg["avg_order_value"].round(2)
        result["data"] = agg.to_dict(orient="records")
        result["hierarchy"] = f"Drilled-down to level: {level.capitalize()}"

    elif operation == "slice":
        # Slice by single dimension, e.g., category
        dim = filters.get("slice_dim", "category") if filters else "category"
        dim = dim if dim in data.columns else "category"
        agg = data.groupby(dim).agg(
            total_revenue=("total_amount", "sum"),
            total_quantity=("quantity", "sum"),
            order_count=("sales_id", "count")
        ).reset_index()
        agg["total_revenue"] = agg["total_revenue"].round(2)
        result["data"] = agg.to_dict(orient="records")
        result["dimension"] = dim

    elif operation == "dice":
        # Multi-dimensional Dice (Region x Category x Year)
        dim1 = "region" if "region" in data.columns else "category"
        dim2 = "category" if "category" in data.columns else "region"
        pivot = pd.pivot_table(
            data,
            values="total_amount",
            index=dim1,
            columns=dim2,
            aggfunc="sum",
            fill_value=0
        ).round(2)
        
        # Format as rows and columns for table
        dice_matrix = []
        for idx_val, row in pivot.iterrows():
            row_dict = {dim1: idx_val}
            for col_val in pivot.columns:
                row_dict[str(col_val)] = float(row[col_val])
            dice_matrix.append(row_dict)

        result["data"] = dice_matrix
        result["columns"] = [dim1] + [str(c) for c in pivot.columns]
        result["dimensions"] = [dim1, dim2]

    # Global OLAP summary metrics
    result["summary"] = {
        "filtered_records": len(data),
        "total_revenue": round(float(data["total_amount"].sum()), 2),
        "total_quantity": int(data["quantity"].sum()),
        "distinct_customers": int(data["customer_id"].nunique()) if "customer_id" in data.columns else 0
    }

    return result
