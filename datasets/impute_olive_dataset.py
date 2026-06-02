"""
Olive Dataset — Source-Aware Imputation for Price Prediction
=============================================================
USAGE:
    python impute_olive_dataset.py

    Edit INPUT_PATH below to point to your CSV file.

Outputs:
    master_olive_dataset_imputed.csv  — full dataset with imputed values
    sales_model_ready.csv             — 60-row sales table ready for modeling
"""

import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from sklearn.preprocessing import LabelEncoder

# ── CONFIGURE ─────────────────────────────────────────────────────────────────
INPUT_PATH  = "master_olive_dataset_clean.csv"   # ← change if needed
OUT_FULL    = "master_olive_dataset_imputed.csv"
OUT_MODEL   = "sales_model_ready.csv"

# ── 0. Load ───────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_PATH)
print(f"Loaded: {df.shape[0]} rows × {df.shape[1]} columns")
original_nulls = df.isnull().sum().sum()
print(f"Total null cells before : {original_nulls:,}")

df_out = df.copy()

# ── 1. SALES — olive_oil_dataset ──────────────────────────────────────────────
# Core price/cost/revenue/quantity/stock are already 100 % complete.
# Nulls in other columns are structural (foreign-source fields) — leave them.
sales_mask = df_out['source_dataset'] == 'olive_oil_dataset'
core_sales  = ['price', 'cost', 'quantity_sold', 'revenue', 'stock']
print(f"\n[1] Sales rows          : {sales_mask.sum()}")
print(f"    Core column nulls   : {df_out.loc[sales_mask, core_sales].isnull().sum().sum()}")

# ── 2. QUALITY — world_olive_oil_gi + _alt ────────────────────────────────────
quality_cols = [
    'maximum_acidity_g_100g',
    'maximum_peroxide_value_meq_02_kg',
    'k232_max',
    'k268_max',
    'k270_max',
    'delta_k_max',
    'maximum_yield_kg_ha',
    'maximum_planting_density_n_ha',
    'yield_in_oil_pct',
]

for src in ['world_olive_oil_gi', 'world_olive_oil_gi_alt']:
    gi_mask = df_out['source_dataset'] == src
    gi      = df_out.loc[gi_mask, :].copy()
    nb      = gi[quality_cols].isnull().sum().sum()

    le = LabelEncoder()
    gi['_oil_enc'] = le.fit_transform(gi['oil_type'].fillna('na'))

    imputer    = KNNImputer(n_neighbors=5)
    imp_arr    = imputer.fit_transform(gi[['_oil_enc'] + quality_cols])
    imp_df     = pd.DataFrame(imp_arr, columns=['_oil_enc'] + quality_cols, index=gi.index)

    for col in quality_cols:
        df_out.loc[gi_mask, col] = imp_df[col]

    na = df_out.loc[gi_mask, quality_cols].isnull().sum().sum()
    print(f"\n[2] {src}")
    print(f"    KNN imputation ({len(quality_cols)} quality cols): {nb} → {na} nulls")

# ── 3. FAOSTAT — production / trade value ────────────────────────────────────
for src in ['faostat_2026_04_20', 'faostat_2026_04_09']:
    fao_mask = df_out['source_dataset'] == src
    fao      = df_out.loc[fao_mask, :].copy()
    nb       = fao['value'].isnull().sum()

    # Group median per (area, element), then global median as fallback
    group_med = fao.groupby(['area', 'element'])['value'].transform('median')
    fao['value'] = fao['value'].fillna(group_med).fillna(fao['value'].median())
    df_out.loc[fao_mask, 'value'] = fao['value']

    na = df_out.loc[fao_mask, 'value'].isnull().sum()
    print(f"\n[3] {src}")
    print(f"    Median imputation on 'value': {nb} → {na} nulls")

# ── 4. STATISTICS — already complete ─────────────────────────────────────────
stats_mask = df_out['source_dataset'] == 'statistics'
stats_core = ['country', 'haverst_period', 'product_type', 'indicator', 'tonnes']
print(f"\n[4] Statistics rows     : {stats_mask.sum()}")
print(f"    Core column nulls   : {df_out.loc[stats_mask, stats_core].isnull().sum().sum()}")

# ── 5. Summary ────────────────────────────────────────────────────────────────
remaining = df_out.isnull().sum().sum()
print(f"\n{'='*50}")
print(f"Nulls before  : {original_nulls:,}")
print(f"Nulls after   : {remaining:,}  (remaining are structural cross-source gaps)")
print(f"Imputed       : {original_nulls - remaining:,} cells")

# ── 6. Save full imputed dataset ──────────────────────────────────────────────
df_out.to_csv(OUT_FULL, index=False)
print(f"\nSaved full dataset : {OUT_FULL}")

# ── 7. Model-ready sales table ────────────────────────────────────────────────
sales_df = df_out[df_out['source_dataset'] == 'olive_oil_dataset'].copy()
sales_df = sales_df.sort_values('date').reset_index(drop=True)
sales_df['month'] = sales_df['month'].astype(int)
sales_df['year']  = sales_df['year'].astype(int)

# Derived features
sales_df['margin']         = sales_df['price'] - sales_df['cost']
sales_df['margin_pct']     = (sales_df['margin'] / sales_df['price']).round(4)
sales_df['price_lag1']     = sales_df['price'].shift(1)
sales_df['price_lag2']     = sales_df['price'].shift(2)
sales_df['price_rolling3'] = sales_df['price'].shift(1).rolling(3).mean()

# Fill lag NaNs at series start
for c in ['price_lag1', 'price_lag2', 'price_rolling3']:
    sales_df[c] = sales_df[c].bfill().fillna(sales_df['price'].median())

# Aggregate GI quality averages (global mean per metric → scalar enrichment)
gi_all = df_out[df_out['source_dataset'] == 'world_olive_oil_gi'][quality_cols]
for col in quality_cols:
    sales_df[f'gi_mean_{col}'] = round(gi_all[col].mean(), 4)

# Global olive production by year from FAOSTAT
fao_prod = df_out[
    (df_out['source_dataset'].str.startswith('faostat')) &
    (df_out['element'] == 'Production')
][['year', 'value']].dropna()

if not fao_prod.empty:
    prod_by_year = fao_prod.groupby('year')['value'].sum().reset_index()
    prod_by_year.columns = ['year', 'global_production_tonnes']
    sales_df = sales_df.merge(prod_by_year, on='year', how='left')
    global_mean = prod_by_year['global_production_tonnes'].mean()
    sales_df['global_production_tonnes'] = sales_df['global_production_tonnes'].fillna(global_mean)

# Drop columns that are fully null or source-metadata only
drop_cols = [
    'source_dataset', 'record_type', 'product',
    'domain_code', 'domain', 'area_code_m49', 'area', 'element_code', 'element',
    'item_code_cpc', 'item', 'year_code', 'unit', 'value', 'flag', 'flag_description',
    'item_code_fbs', 'feature_id', 'name', 'country', 'olive_varieties', 'oil_type',
    'link', 'administrative_units', 'date_of_application', 'date_of_publication',
    'date_of_registration', 'price_developments_for_olive_oil', 'haverst_period',
    'product_type', 'indicator', 'tonnes', 'irrigation',
]
sales_df = sales_df.drop(columns=[c for c in drop_cols if c in sales_df.columns])

sales_df.to_csv(OUT_MODEL, index=False)
print(f"Saved model-ready table: {OUT_MODEL}  ({sales_df.shape[0]} rows × {sales_df.shape[1]} cols)")

print("\nFeature columns in model-ready table:")
for c in sales_df.columns:
    print(f"  {c}")
