/**
 * Validation & Cross-Document Engine for Dairy Cooperative Hub
 */

function validateDocumentRules(extractedData, documentType, config = {}) {
  const maxTemp = config.coldChainMaxTempC || 4.0;
  const minFat = config.fatMinStandardPct || 3.0;
  const maxFat = config.fatMaxStandardPct || 5.5;

  const rules = [];
  let isException = false;
  let exceptionReason = '';

  if (extractedData.fatPercentage !== undefined) {
    const fat = Number(extractedData.fatPercentage);
    const passed = fat >= minFat && fat <= maxFat;
    rules.push({
      rule: `Fat % standard check (${minFat}% - ${maxFat}%)`,
      passed,
      detail: passed ? `${fat}% is within standard limits.` : `${fat}% is outside standard bounds!`,
    });
    if (!passed) {
      isException = true;
      exceptionReason = `Milk Fat content ${fat}% violates standard quality limits (${minFat}% - ${maxFat}%).`;
    }
  }

  if (extractedData.temperatureC !== undefined) {
    const temp = Number(extractedData.temperatureC);
    const passed = temp <= maxTemp;
    rules.push({
      rule: `Cold-chain max temp check (<= ${maxTemp}°C)`,
      passed,
      detail: passed ? `${temp}°C is safely below threshold.` : `${temp}°C exceeds max limit of ${maxTemp}°C!`,
    });
    if (!passed) {
      isException = true;
      exceptionReason = `Cold-chain breach: Temperature ${temp}°C exceeds maximum threshold of ${maxTemp}°C.`;
    }
  }

  if (extractedData.bacterialCountCFU !== undefined) {
    const cfu = Number(extractedData.bacterialCountCFU);
    const passed = cfu < 100000;
    rules.push({
      rule: 'Bacterial CFU count limit (< 100,000 / ml)',
      passed,
      detail: passed ? `${cfu} CFU/ml is acceptable.` : `${cfu} CFU/ml exceeds safety threshold!`,
    });
    if (!passed) {
      isException = true;
      exceptionReason = `High bacterial count (${cfu} CFU/ml). Requires immediate quarantine.`;
    }
  }

  return {
    rules,
    isException,
    exceptionReason,
  };
}

module.exports = {
  validateDocumentRules,
};
