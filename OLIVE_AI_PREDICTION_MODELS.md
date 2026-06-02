# Olive Dataset AI Prediction Model Report

## Project Scope

The workspace is centered on an olive and olive-oil domain, with datasets that support multiple machine-learning tasks. The data is not limited to one problem type: it includes time-series sales data, annual agricultural production data, market price data, geographical-indication quality records, and international loss/waste statistics.

This means the project can support several prediction directions instead of a single model. The best choice depends on the business question you want to answer in Google Colab later.

## Dataset Inventory and What Each File Can Support

### 1. `datasets/olive_oil_dataset.csv`

Observed structure:
- `date`
- `year`
- `month`
- `product`
- `quantity_sold`
- `price`
- `cost`
- `revenue`
- `stock`

Best suited for:
- sales forecasting
- price prediction
- revenue prediction
- stock level prediction
- demand planning

Why it is useful:
- It is a clean monthly time-series dataset.
- It contains both targets and explanatory variables.
- It supports supervised learning and forecasting.

### 2. `datasets/FAOSTAT_data_en_4-20-2026.csv` and `datasets/FAOSTAT_data_en_4-9-2026.csv`

Observed structure:
- country/area
- year
- item = olives
- value = gross production value
- unit = `1000 Int$`

Best suited for:
- annual production forecasting
- country-level trend prediction
- agricultural output regression
- regional comparison and ranking

Why it is useful:
- It is a long annual series.
- It can be used to predict future production values per country.
- It is strong for classical time-series methods.

### 3. `datasets/World_OliveOil_GI.csv`

Observed structure:
- feature ID
- country
- olive varieties
- oil type
- maximum yield
- irrigation
- planting density
- yield in oil
- maximum acidity
- maximum peroxide value
- K232 / K268 / K270 / Delta K
- administrative units
- registration dates

Best suited for:
- olive oil quality classification
- certification category prediction
- quality score regression
- geographic origin analysis
- rule-based or ML-assisted labeling

Why it is useful:
- This dataset is mostly cross-sectional.
- It contains quality-related technical indicators.
- It is ideal for classification or regression rather than forecasting.

### 4. `datasets/UNdata_Export_20260518_113022018.xml` and `datasets/UNdata_Export_20260518_113204216.xml`

Observed structure:
- country or area
- element = losses
- year
- unit
- value

Best suited for:
- loss forecasting
- country-level trend analysis
- waste pattern prediction
- anomaly detection in yearly losses

Why it is useful:
- The XML records are structured and time-based.
- They can support macro-level agricultural or food-loss forecasting.

### 5. `datasets/olive-oil-market-prices_en.xlsx`

Likely use cases based on file naming and workbook size:
- market price forecasting
- price trend analysis
- seasonality detection
- market volatility analysis

Why it is useful:
- The workbook appears to contain a large time-series sheet.
- It is likely the best candidate for market-level forecasting if the sheet contains monthly price history.

### 6. `datasets/statistics.xlsx`

Likely use cases:
- summary statistics
- dashboard metrics
- aggregated market indicators
- exploratory analysis support

Why it is useful:
- It may not be the main training dataset.
- It is still useful for data understanding, validation, and reporting.

## Possible Prediction Models We Can Build

### A. Olive Oil Sales Forecasting

Goal:
- Predict future `quantity_sold`, `revenue`, or `stock` from monthly sales history.

Best datasets:
- `olive_oil_dataset.csv`

Recommended model families:
- Linear Regression
- Random Forest Regressor
- XGBoost Regressor
- SARIMA / ARIMA
- Prophet
- LSTM or GRU if you want a deep-learning time-series approach

Best target choices:
- `quantity_sold`
- `revenue`
- `stock`
- `price`

Why this is a strong option:
- The dataset is already structured as monthly observations.
- It is the easiest starting point for a Colab prototype.

### B. Olive Production Value Forecasting

Goal:
- Predict annual olive production value by country or region.

Best datasets:
- `FAOSTAT_data_en_4-20-2026.csv`
- `FAOSTAT_data_en_4-9-2026.csv`

Recommended model families:
- ARIMA / SARIMA
- Prophet
- Random Forest Regressor
- XGBoost Regressor
- LightGBM Regressor

Best target choices:
- gross production value

Why this is a strong option:
- It provides long historical annual data.
- It is suitable for country-level forecasting and comparison.

### C. Olive Oil Price Prediction

Goal:
- Predict future market price from historical price patterns and possibly related commercial indicators.

Best datasets:
- `olive_oil_dataset.csv`
- `olive-oil-market-prices_en.xlsx`

Recommended model families:
- Linear Regression with lag features
- Random Forest Regressor
- XGBoost Regressor
- Prophet
- LSTM / GRU for sequence learning

Best target choices:
- price
- market index or price trend if available in the Excel file

Why this is a strong option:
- Price is a natural forecasting target.
- It can later be combined with seasonality and trend features.

### D. Olive Oil Quality Classification

Goal:
- Predict whether an olive oil sample belongs to a quality category or GI-related classification.

Best datasets:
- `World_OliveOil_GI.csv`

Recommended model families:
- Logistic Regression
- Decision Tree Classifier
- Random Forest Classifier
- XGBoost Classifier
- Support Vector Machine

Possible targets:
- oil type
- GI category
- certification status
- quality class derived from acidity/peroxide thresholds

Why this is a strong option:
- The dataset contains lab-style quality variables.
- It is ideal for supervised classification.

### E. Olive Yield or Quality Regression

Goal:
- Predict numeric quality-related or productivity-related values.

Best datasets:
- `World_OliveOil_GI.csv`
- `olive_oil_dataset.csv`

Recommended model families:
- Linear Regression
- Ridge / Lasso Regression
- Random Forest Regressor
- Gradient Boosting Regressor
- XGBoost Regressor

Possible targets:
- maximum yield
- yield in oil
- acidity
- peroxide value
- price

Why this is useful:
- It turns the project into a numeric prediction study rather than just classification.

### F. Loss and Waste Forecasting

Goal:
- Predict food-loss trends by country and year.

Best datasets:
- `UNdata_Export_20260518_113022018.xml`
- `UNdata_Export_20260518_113204216.xml`

Recommended model families:
- ARIMA / SARIMA
- Prophet
- Random Forest Regressor
- XGBoost Regressor

Target:
- losses value

Why this is useful:
- It is a country-level yearly forecasting problem.
- It can complement the olive business report with sustainability analysis.

## Best Starter Models for Google Colab

If the goal is to start quickly and get solid results, the recommended order is:

1. `olive_oil_dataset.csv` + Random Forest Regressor or XGBoost Regressor for `quantity_sold` and `price` prediction.
2. `FAOSTAT_data_en_4-20-2026.csv` + Prophet or SARIMA for annual olive production forecasting.
3. `World_OliveOil_GI.csv` + Random Forest Classifier for quality or category prediction.

These are the most practical first experiments because they are easier to prepare, explain, and validate in a report.

## Recommended Project Direction

The most coherent AI prediction project for this workspace is:

- primary track: olive oil sales and price forecasting
- secondary track: olive production forecasting by country
- optional extension: olive oil quality classification using GI data

This gives the report a clear story:
- market behavior prediction
- agricultural trend prediction
- product quality prediction

## Conclusion

The datasets support a multi-model olive analytics project rather than a single prediction task. The strongest candidates are:

- sales forecasting from `olive_oil_dataset.csv`
- production forecasting from FAOSTAT data
- quality classification from `World_OliveOil_GI.csv`
- market price prediction from the price workbook
- loss forecasting from the UN XML files

For the first Colab implementation, the best starting point is a time-series regression/forecasting model on `olive_oil_dataset.csv`, then expanding to FAOSTAT and GI-based classification.
