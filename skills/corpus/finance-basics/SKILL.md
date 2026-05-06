---
name: finance-basics
version: 1.0.0
description: >
  Calculates simple and compound interest, percentage changes, loan payments, and investment returns.
  Triggered when users need to compute interest, monthly loan costs, or growth on their savings.
triggers:
  - interest
  - loan
  - percentage
  - roi
  - mortgage
  - growth
  - principal
tags:
  - finance
  - math
  - calculations
execution:
  enabled: true
  runtime: python
  timeout_seconds: 5
  allow_network: false
  allow_filesystem: false
  memory_limit_mb: 64
  entrypoint: run
context:
  inject_before_llm: true
  output_label: "Financial Calculation Result"
author: bemi-core
created: 2024-05-22
updated: 2026-05-06
enabled: true
---

## Purpose

Provides precise financial computations including interest (simple/compound), loan amortizations, percentage shifts (increase/decrease), and Return on Investment (ROI). This tool ensures accuracy for financial planning queries.

## Parameters

- `calc_type` (string, required) — One of: "simple_interest", "compound_interest", "percentage", "loan", "roi"
- `principal` (float, optional) — The initial amount of money
- `rate` (float, optional) — The interest rate or percentage
- `time` (float, optional) — Time period (usually in years)
- `compounds_per_year` (int, optional) — Number of times interest is compounded per year
- `target_value` (float, optional) — Used for percentage change or final value
- `months` (int, optional) — Duration for loans in months

## Code
```python
def run(calc_type, principal=0, rate=0, time=0, compounds_per_year=1, target_value=0, months=0):
    # Normalize rate to decimal if provided as whole number > 1 (e.g. 5 -> 0.05)
    r = rate / 100 if rate >= 1 or rate < 0 else rate
    
    if calc_type == "simple_interest":
        interest = principal * r * time
        return {"total": principal + interest, "interest_earned": interest}
        
    elif calc_type == "compound_interest":
        n = compounds_per_year
        amount = principal * (1 + r/n)**(n * time)
        return {"total": round(amount, 2), "interest_earned": round(amount - principal, 2)}
        
    elif calc_type == "percentage":
        if target_value != 0:
            diff = target_value - principal
            pct_change = (diff / principal) * 100
            return {"difference": diff, "percentage_change": f"{round(pct_change, 2)}%"}
        else:
            return {"result": principal * r}
            
    elif calc_type == "loan":
        monthly_rate = r / 12
        n_payments = months if months > 0 else time * 12
        if monthly_rate == 0:
            payment = principal / n_payments
        else:
            payment = principal * (monthly_rate * (1 + monthly_rate)**n_payments) / ((1 + monthly_rate)**n_payments - 1)
        return {"monthly_payment": round(payment, 2), "total_repayment": round(payment * n_payments, 2)}
        
    elif calc_type == "roi":
        roi = ((target_value - principal) / principal) * 100
        return {"roi_percentage": f"{round(roi, 2)}%", "net_profit": target_value - principal}
        
    return {"error": "Invalid calculation type"}
```

## Response guidance

1. **For Math:** Always lead with the calculated number. Be precise but helpful (e.g., "2.12 cups is roughly 2 cups and 2 tablespoons").
2. **For Substitutions:** Explain why the substitution works or if it changes the texture (e.g., "Applesauce works for butter but will make the cake denser").
3. **For Scaling:** Clearly state the new quantities for every ingredient the user mentions.

## Examples
**User:** Calculate simple interest on $5,000 at 4% for 3 years.
**BEMI:** [runs code] $600 is the interest earned. Your total balance after 3 years will be $5,600.  

**User:** How much will $10,000 grow to in 5 years at 7% compounded monthly?
**BEMI:** [runs code] $14,176.25 is your final amount. This includes $4,176.25 in interest earned over 5 years.  

**User:** What is the monthly payment for a $300,000 mortgage at 6% for 30 years?
**BEMI:** [runs code] $1,798.65 is your monthly payment. Over 30 years, your total repayment will be $647,514.57.  

**User:** If I buy a stock at $50 and sell at $75, what's my ROI?
**BEMI:** [runs code] 50% is your Return on Investment. Your net profit is $25.00 per share.  

**User:** What's a 15% tip on a $85 bill?
**BEMI:** [runs code] $12.75 is the tip amount. This brings your total bill to $97.75.  

**User:** If my rent goes from $1200 to $1350, what is the percentage increase?
**BEMI:** [runs code] 12.5% is the increase in your rent. You are paying $150 more per month.  

**User:** How much interest will I pay on a $15,000 car loan over 5 years at 5% interest?
**BEMI:** [runs code] $1,983.86 is the total interest you will pay. Your monthly payment will be $283.07.  

**User:** Calculate the final balance of $2,500 with 3% compound interest for 10 years.
**BEMI:** [runs code] $3,359.79 is the total value of your account after 10 years.  

**User:** I have $1,000. If it decreases by 22%, what is left?
**BEMI:** [runs code] $780 is the remaining value after a 22% decrease.  

**User:** What is the ROI on a property bought for $200k and sold for $250k?
**BEMI:** [runs code] 25% is your ROI. This represents a net profit of $50,000.  

**User:** Monthly payment for a $20,000 personal loan at 10% for 36 months?
**BEMI:** [runs code] $645.34 is your monthly payment. Total repayment will be $23,232.24.  

**User:** What is 7.5% of $1,240,000?
**BEMI:** [runs code] $93,000 is 7.5% of that amount.  

**User:** How much interest is earned on $500 at 2% over 6 months?
**BEMI:** [runs code] $5.00 is the interest earned using simple interest calculation.  

**User:** If I invest $5,000 and it doubles, what's the ROI?
**BEMI:** [runs code] 100% is your ROI when your investment doubles.  

**User:** Calculate compound interest for $8,000 at 5% compounded quarterly for 2 years.
**BEMI:** [runs code] $8,835.89 is the total amount, with $835.89 in interest earned.  

**User:** My portfolio went from $50,000 to $42,000. What's the percentage loss?
**BEMI:** [runs code] -16% is your percentage change. You have lost $8,000.  

**User:** How much will a $1,500 laptop cost with 8.25% sales tax?
**BEMI:** [runs code] $1,623.75 is the total price including tax.  

**User:** Simple interest on $10,000 at 1.5% for 12 years?
**BEMI:** [runs code] $1,800 is the total interest earned over the 12-year period.  

**User:** Monthly payment on a $5,000 credit card balance at 18% interest over 24 months?
**BEMI:** [runs code] $249.62 is the monthly payment to clear the balance in 2 years.  

**User:** What's the total repayment on a $10,000 loan at 4% for 5 years?
**BEMI:** [runs code] $11,054.99 is the total repayment amount with a monthly payment of $184.25.  

**User:** If a $60 shirt is 30% off, what's the price?
**BEMI:** [runs code] $42 is the sale price after the $18 discount.  

**User:** ROI of a marketing campaign: $1,000 spent, $3,500 earned.
**BEMI:** [runs code] 250% is the ROI. Your net profit is $2,500.  

**User:** Compound interest on $1,000,000 at 2.5% for 20 years.
**BEMI:** [runs code] $1,638,616.44 is the final balance if compounded annually.  

**User:** If I save $200 a month for a year at 0% interest, then it grows by 5% the next year?
**BEMI:** [runs code] $2,520 is the final amount after your total savings ($2,400) grows by 5%.  

**User:** What is the percentage difference between 450 and 600?
**BEMI:** [runs code] 33.33% is the increase from 450 to 600.  

**User:** Loan payment for $12,000 at 7.5% for 48 months.
**BEMI:** [runs code] $290.15 is your monthly payment.  

**User:** Calculate 0.5% of $50,000.
**BEMI:** [runs code] $250 is 0.5% of $50,000.  

**User:** If my salary increases by 3% from $65,000, what's the new salary?
**BEMI:** [runs code] $66,950 is your new annual salary.  

**User:** Total interest on $2,000 at 12% simple interest for 18 months.
**BEMI:** [runs code] $360 is the interest accrued over 1.5 years.  

**User:** Compound $500 at 10% daily for 1 year.
**BEMI:** [runs code] $552.58 is the final balance with daily compounding.  

**User:** ROI on a $10 crypto investment that went to $1,000.
**BEMI:** [runs code] 9900% is your ROI. Your net profit is $990.  

**User:** Monthly mortgage on $500k at 5.5% for 15 years.
**BEMI:** [runs code] $4,085.42 is the monthly payment for a 15-year term.  

**User:** What is a 20% increase on 1,500?
**BEMI:** [runs code] 1,800 is the new value after a $300 increase.  

**User:** If a population grows from 1m to 1.2m, what is the % growth?
**BEMI:** [runs code] 20% is the growth rate of the population.  

**User:** Interest on a $4,000 loan at 6% simple interest for 9 months.
**BEMI:** [runs code] $180 is the interest charged for the 9-month period.  

**User:** How much is 1/4 percent of 1,000,000?
**BEMI:** [runs code] 2,500 is 0.25% of one million.  

**User:** Total value of $12,000 after 5 years at 6% compounded semi-annually.
**BEMI:** [runs code] $16,126.93 is the final value of the investment.  

**User:** Credit card payment: $2,500 at 24% for 12 months.
**BEMI:** [runs code] $236.43 is the monthly payment required.  

**User:** Sale price of a $200 item with 45% discount.
**BEMI:** [runs code] $110 is the price after the $90 discount.  

**User:** Business ROI: Initial $50k, final value $80k.
**BEMI:** [runs code] 60% is the ROI on your business investment.  

**User:** Simple interest on $7,500 at 3.2% for 4 years.
**BEMI:** [runs code] $960 is the total interest earned.  

**User:** Final balance of $3,000 at 0.1% interest compounded monthly for 5 years.
**BEMI:** [runs code] $3,015.04 is the total amount in the account.  

**User:** Percentage decrease from 100 to 78[cite: 1].
**BEMI:** [runs code] 22% is the percentage reduction.

**User:** Monthly payment on a $25,000 boat loan, 6% interest, 60 months[cite: 1].
**BEMI:** [runs code] $483.32 is your monthly payment.

**User:** What's the interest on $10k at 5% simple interest if held for only 3 months[cite: 1]?
**BEMI:** [runs code] $125 is the interest for a quarter of a year.

**User:** If I gain 10% then lose 10% on $100, what is the result[cite: 1]?
**BEMI:** [runs code] $99 is the final amount. You lose 1% overall because the 10% loss applies to the new $110 balance.

**User:** Compound $20,000 at 8% for 40 years[cite: 1].
**BEMI:** [runs code] $434,490.40 is the final balance with annual compounding.

**User:** ROI of a $5,000 education course that led to a $10,000 raise[cite: 1].
**BEMI:** [runs code] 100% is the ROI in the first year alone.

**User:** Percentage of 80 out of 200[cite: 1].
**BEMI:** [runs code] 40% is the portion that 80 represents of 200.

**User:** Loan estimate for $1,000 at 0% for 10 months[cite: 1].
**BEMI:** [runs code] $100 is your monthly payment with no interest charged.