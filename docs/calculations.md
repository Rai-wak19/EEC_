# EEC Transport Sector PMS — KPI Calculations & Methodology

## 1. Schedule & Progress Formulas

### Schedule Variance (SV)
$$\text{Schedule Variance} = \text{Actual Progress (\%)} - \text{Planned Progress (\%ange)}$$

### Schedule Performance Index (SPI)
$$\text{SPI} = \frac{\text{Actual Progress}}{\text{Planned Progress}}$$
*Note: If Planned Progress is 0%, SPI is returned as `null`.*

### Project Health Classification (Traffic Light)
- **GREEN (On Track)**: $\text{SPI} \ge 0.95$
- **YELLOW (At Risk)**: $0.80 \le \text{SPI} < 0.95$
- **RED (Critical Delay)**: $\text{SPI} < 0.80$

## 2. Portfolio Aggregation (Weighted by Contract Value)

$$\text{Portfolio Planned Progress} = \frac{\sum (\text{Project Planned Progress} \times \text{Contract Value})}{\sum \text{Contract Value}}$$

$$\text{Portfolio Actual Progress} = \frac{\sum (\text{Project Actual Progress} \times \text{Contract Value})}{\sum \text{Contract Value}}$$

$$\text{Average Portfolio SPI} = \frac{\sum_{i=1}^N \text{SPI}_i}{N} \quad (\text{where } \text{SPI}_i \neq \text{null})$$

## 3. Financial Monitoring

### Revised Contract Value
$$\text{Revised Value} = \text{Original Contract Value} + \text{Variation Value}$$

### Outstanding Payment (Receivables)
$$\text{Outstanding Payment} = \text{Amount Certified} - \text{Amount Received}$$

### Financial Progress
$$\text{Financial Progress (\%)} = \frac{\text{Amount Received}}{\text{Revised Contract Value}} \times 100$$

## 4. Risk Evaluation

$$\text{Risk Score} = \text{Probability Score (1-3)} \times \text{Impact Score (1-3)}$$
- **LOW (1–2)**: Score $\le 2$
- **MEDIUM (3–4)**: $3 \le \text{Score} \le 4$
- **HIGH / CRITICAL (6–9)**: $\text{Score} \ge 6$

## 5. Resource Shortfall

$$\text{Shortfall} = \max(0, \, \text{Required Quantity} - \text{Available Quantity})$$
