// index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Input validation middleware
const validateInputs = (req, res, next) => {
  const {
    husbandIncome,
    numberOfChildren,
    propertyValue,
    landValue,
    marriageDuration,
    womanIncome
  } = req.body;

  // Check all fields are present
  if (
    husbandIncome == null ||
    numberOfChildren == null ||
    propertyValue == null ||
    landValue == null ||
    marriageDuration == null ||
    womanIncome == null
  ) {
    return res.status(400).json({ error: "All input fields are required." });
  }

  // Validate types and ranges
  const errors = [];
  if (typeof husbandIncome !== 'number' || husbandIncome < 0 || husbandIncome > 100000000) {
    errors.push("Husband's income must be between 0 and 1,00,00,000 INR");
  }
  if (!Number.isInteger(numberOfChildren) || numberOfChildren < 0 || numberOfChildren > 10) {
    errors.push("Number of children must be between 0 and 10");
  }
  if (typeof propertyValue !== 'number' || propertyValue < 0 || propertyValue > 1000000000) {
    errors.push("Property value must be between 0 and 10,00,00,000 INR");
  }
  if (typeof landValue !== 'number' || landValue < 0 || landValue > 1000000000) {
    errors.push("Land value must be between 0 and 10,00,00,000 INR");
  }
  if (typeof marriageDuration !== 'number' || marriageDuration < 0 || marriageDuration > 50) {
    errors.push("Marriage duration must be between 0 and 50 years");
  }
  if (typeof womanIncome !== 'number' || womanIncome < 0 || womanIncome > 100000000) {
    errors.push("Woman's income must be between 0 and 1,00,00,000 INR");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Alimony calculation route
app.post("/calculate-alimony", validateInputs, (req, res) => {
  try {
    const {
      husbandIncome,
      numberOfChildren,
      propertyValue,
      landValue,
      marriageDuration,
      womanIncome
    } = req.body;

    // Formula percentages
    let percentage = 0.25; // Base 25%
    percentage += numberOfChildren * 0.05;
    if (marriageDuration >= 10) percentage += 0.10;
    if (womanIncome > 0) percentage -= 0.10;
    if (propertyValue >= 3000000) percentage += 0.05;
    if (landValue >= 1000000) percentage += 0.03;

    // Limit percentage between 0% and 70%
    percentage = Math.max(0, Math.min(percentage, 0.70));

    const alimonyAmount = Math.round(husbandIncome * percentage);

    return res.json({
      alimony: alimonyAmount,
      percentage: Math.round(percentage * 100),
      breakdown: {
        base: "25%",
        perChild: `${numberOfChildren * 5}%`,
        longMarriage: marriageDuration >= 10 ? "10%" : "0%",
        womanIncomeDeduction: womanIncome > 0 ? "-10%" : "0%",
        propertyBonus: propertyValue >= 3000000 ? "5%" : "0%",
        landBonus: landValue >= 1000000 ? "3%" : "0%"
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred during calculation" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`limony calculator backend running on port ${PORT}`);
});