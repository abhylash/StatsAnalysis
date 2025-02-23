import { mean, std, sum, sqrt, pow } from 'mathjs';

export const StatisticalFormulas = {
  "Mean, Median & Mode (Discrete Data)": {
    mean: "Mean (x̄) = Σ(fx) / Σf",
    median: "Median = Value of ((n+1)/2)th item",
    mode: "Mode = Value with highest frequency"
  },
  "Median & Mode (Continuous Data)": {
    median: "Median = L + ((N/2 - F)/f) × h",
    mode: "Mode = L + ((f1 - f0)/(2f1 - f0 - f2)) × h"
  },
  "Mean Deviation & Std Dev (Discrete Data)": {
    meanDeviation: "MD = Σ|x - x̄|/n",
    standardDeviation: "σ = √(Σ(x - x̄)²/n)"
  },
  "Mean Deviation & Std Dev (Continuous Data)": {
    meanDeviation: "MD = Σ|m - x̄|f/Σf",
    standardDeviation: "σ = √(Σ(m - x̄)²f/Σf)"
  },
  "Skewness & Kurtosis": {
    skewness: "Skewness = Σ((x - x̄)³)/(n × σ³)",
    kurtosis: "Kurtosis = Σ((x - x̄)⁴)/(n × σ⁴)"
  },
  "Correlation Coefficient": {
    correlation: "r = Σ((x - x̄)(y - ȳ))/(√(Σ(x - x̄)²)(Σ(y - ȳ)²))"
  },
  "Regression (Y on X)": {
    regression: "Y = a + bX, where b = Σ(xy)/Σ(x²)"
  },
  "Regression (X on Y)": {
    regression: "X = a + bY, where b = Σ(xy)/Σ(y²)"
  },
  "Straight Line Fit": {
    formula: "Y = a + bX",
    coefficients: "b = (nΣxy - ΣxΣy)/(nΣx² - (Σx)²), a = ȳ - bx̄"
  },
  "Parabola Fit": {
    formula: "Y = a + bX + cX²",
    coefficients: "Using method of least squares"
  },
  "Exponential Curve Fit": {
    formula: "Y = ae^(bX)",
    coefficients: "Using logarithmic transformation"
  },
  "Power Curve Fit": {
    formula: "Y = aX^b",
    coefficients: "Using logarithmic transformation"
  }
};

const calculateDiscreteMMM = (data: any[]) => {
  const calculationTable = data.map(row => ({
    classInterval: row.classInterval,
    frequency: row.frequency,
    midpoint: row.midpoint,
    fx: row.midpoint * row.frequency
  }));

  const totalF = sum(calculationTable.map(row => row.frequency));
  const totalFX = sum(calculationTable.map(row => row.fx));
  const meanValue = totalFX / totalF;

  let cumFreq = 0;
  const medianPos = (totalF + 1) / 2;
  let medianClass;
  const medianCalcTable = calculationTable.map(row => {
    cumFreq += row.frequency;
    if (!medianClass && cumFreq >= medianPos) {
      medianClass = row;
    }
    return { ...row, cumulativeFreq: cumFreq };
  });

  const modeClass = calculationTable.reduce((a, b) => 
    a.frequency > b.frequency ? a : b
  );

  return {
    formulas: StatisticalFormulas["Mean, Median & Mode (Discrete Data)"],
    steps: {
      calculationTable,
      medianCalcTable,
      totals: { totalF, totalFX },
      meanCalc: `${totalFX} / ${totalF} = ${meanValue.toFixed(2)}`,
      medianCalc: `Position: ${medianPos}, Class: ${medianClass.classInterval}`,
      modeCalc: `Highest frequency class: ${modeClass.classInterval}`
    },
    results: {
      mean: meanValue.toFixed(2),
      median: medianClass.midpoint.toFixed(2),
      mode: modeClass.midpoint.toFixed(2)
    }
  };
};

const calculateContinuousMMM = (data: any[]) => {
  const calculationTable = data.map(row => ({
    ...row,
    fx: row.midpoint * row.frequency
  }));

  let cumFreq = 0;
  const totalF = sum(calculationTable.map(row => row.frequency));
  const medianPos = totalF / 2;
  
  const medianCalcTable = calculationTable.map(row => {
    const prevCumFreq = cumFreq;
    cumFreq += row.frequency;
    return { ...row, prevCumFreq, cumulativeFreq: cumFreq };
  });

  const medianClass = medianCalcTable.find(row => row.cumulativeFreq >= medianPos);
  const [l1, l2] = medianClass.classInterval.split("-").map(Number);
  const h = l2 - l1;
  const medianValue = l1 + ((medianPos - medianClass.prevCumFreq) / medianClass.frequency) * h;

  const modeClass = calculationTable.reduce((a, b) => 
    a.frequency > b.frequency ? a : b
  );
  const modeIndex = calculationTable.indexOf(modeClass);
  const f1 = modeClass.frequency;
  const f0 = modeIndex > 0 ? calculationTable[modeIndex - 1].frequency : 0;
  const f2 = modeIndex < calculationTable.length - 1 ? calculationTable[modeIndex + 1].frequency : 0;
  const [ml1, ml2] = modeClass.classInterval.split("-").map(Number);
  const modeH = ml2 - ml1;
  const modeValue = ml1 + ((f1 - f0) / (2 * f1 - f0 - f2)) * modeH;

  return {
    formulas: StatisticalFormulas["Median & Mode (Continuous Data)"],
    steps: {
      calculationTable: medianCalcTable,
      medianCalc: `L = ${l1}, h = ${h}, N/2 = ${medianPos}, F = ${medianClass.prevCumFreq}, f = ${medianClass.frequency}`,
      modeCalc: `L = ${ml1}, h = ${modeH}, f1 = ${f1}, f0 = ${f0}, f2 = ${f2}`
    },
    results: {
      median: medianValue.toFixed(2),
      mode: modeValue.toFixed(2)
    }
  };
};

const calculateDiscreteDeviations = (data: any[]) => {
  const values = data.flatMap(row => Array(row.frequency).fill(row.midpoint));
  const meanValue = mean(values);
  
  const deviations = values.map(x => Math.abs(x - meanValue));
  const meanDeviation = mean(deviations);
  
  const standardDeviation = std(values);

  const calculationTable = data.map(row => ({
    classInterval: row.classInterval,
    frequency: row.frequency,
    midpoint: row.midpoint,
    deviation: Math.abs(row.midpoint - meanValue),
    squaredDeviation: Math.pow(row.midpoint - meanValue, 2)
  }));

  return {
    formulas: StatisticalFormulas["Mean Deviation & Std Dev (Discrete Data)"],
    steps: {
      calculationTable,
      meanCalc: `Mean = ${meanValue.toFixed(2)}`,
      deviationCalc: `MD = ${meanDeviation.toFixed(2)}`,
      stdDevCalc: `σ = ${standardDeviation.toFixed(2)}`
    },
    results: {
      mean: meanValue.toFixed(2),
      meanDeviation: meanDeviation.toFixed(2),
      standardDeviation: standardDeviation.toFixed(2)
    }
  };
};

const calculateContinuousDeviations = (data: any[]) => {
  const totalF = sum(data.map(row => row.frequency));
  const totalFX = sum(data.map(row => row.midpoint * row.frequency));
  const meanValue = totalFX / totalF;

  const calculationTable = data.map(row => ({
    classInterval: row.classInterval,
    frequency: row.frequency,
    midpoint: row.midpoint,
    deviation: Math.abs(row.midpoint - meanValue) * row.frequency,
    squaredDeviation: Math.pow(row.midpoint - meanValue, 2) * row.frequency
  }));

  const meanDeviation = sum(calculationTable.map(row => row.deviation)) / totalF;
  const standardDeviation = sqrt(sum(calculationTable.map(row => row.squaredDeviation)) / totalF);

  return {
    formulas: StatisticalFormulas["Mean Deviation & Std Dev (Continuous Data)"],
    steps: {
      calculationTable,
      meanCalc: `Mean = ${meanValue.toFixed(2)}`,
      deviationCalc: `MD = ${meanDeviation.toFixed(2)}`,
      stdDevCalc: `σ = ${standardDeviation.toFixed(2)}`
    },
    results: {
      mean: meanValue.toFixed(2),
      meanDeviation: meanDeviation.toFixed(2),
      standardDeviation: standardDeviation.toFixed(2)
    }
  };
};

const calculateSkewnessKurtosis = (data: any[]) => {
  const values = data.flatMap(row => Array(row.frequency).fill(row.midpoint));
  const meanValue = mean(values);
  const standardDeviation = std(values);

  const calculationTable = data.map(row => ({
    classInterval: row.classInterval,
    frequency: row.frequency,
    midpoint: row.midpoint,
    deviation: row.midpoint - meanValue,
    deviationCubed: Math.pow(row.midpoint - meanValue, 3) * row.frequency,
    deviationFourth: Math.pow(row.midpoint - meanValue, 4) * row.frequency
  }));

  const totalF = sum(data.map(row => row.frequency));
  const skewness = sum(calculationTable.map(row => row.deviationCubed)) / (totalF * Math.pow(standardDeviation, 3));
  const kurtosis = sum(calculationTable.map(row => row.deviationFourth)) / (totalF * Math.pow(standardDeviation, 4));

  return {
    formulas: StatisticalFormulas["Skewness & Kurtosis"],
    steps: {
      calculationTable,
      meanCalc: `Mean = ${meanValue.toFixed(2)}`,
      stdDevCalc: `σ = ${standardDeviation.toFixed(2)}`,
      skewnessCalc: `Skewness = ${skewness.toFixed(2)}`,
      kurtosisCalc: `Kurtosis = ${kurtosis.toFixed(2)}`
    },
    results: {
      mean: meanValue.toFixed(2),
      standardDeviation: standardDeviation.toFixed(2),
      skewness: skewness.toFixed(2),
      kurtosis: kurtosis.toFixed(2)
    }
  };
};

const calculateCorrelation = (data: any[]) => {
  const xValues = data.map(row => row.midpoint);
  const yValues = data.map(row => row.frequency);
  
  const xMean = mean(xValues);
  const yMean = mean(yValues);
  
  const calculationTable = data.map((row, i) => ({
    x: row.midpoint,
    y: row.frequency,
    xDeviation: row.midpoint - xMean,
    yDeviation: row.frequency - yMean,
    xyDeviation: (row.midpoint - xMean) * (row.frequency - yMean),
    xDeviationSquared: Math.pow(row.midpoint - xMean, 2),
    yDeviationSquared: Math.pow(row.frequency - yMean, 2)
  }));

  const numerator = sum(calculationTable.map(row => row.xyDeviation));
  const denominator = sqrt(
    sum(calculationTable.map(row => row.xDeviationSquared)) *
    sum(calculationTable.map(row => row.yDeviationSquared))
  );
  
  const correlation = numerator / denominator;

  return {
    formulas: StatisticalFormulas["Correlation Coefficient"],
    steps: {
      calculationTable,
      correlationCalc: `r = ${correlation.toFixed(2)}`
    },
    results: {
      correlation: correlation.toFixed(2)
    }
  };
};

const calculateRegressionYonX = (data: any[]) => {
  const xValues = data.map(row => row.midpoint);
  const yValues = data.map(row => row.frequency);
  
  const xMean = mean(xValues);
  const yMean = mean(yValues);
  
  const calculationTable = data.map(row => ({
    x: row.midpoint,
    y: row.frequency,
    xy: row.midpoint * row.frequency,
    xSquared: Math.pow(row.midpoint, 2)
  }));

  const sumXY = sum(calculationTable.map(row => row.xy));
  const sumXSquared = sum(calculationTable.map(row => row.xSquared));
  
  const b = sumXY / sumXSquared;
  const a = yMean - b * xMean;

  const regressionLine = xValues.map(x => ({
    x,
    y: a + b * x
  }));

  return {
    formulas: StatisticalFormulas["Regression (Y on X)"],
    steps: {
      calculationTable,
      regressionCalc: `Y = ${a.toFixed(2)} + ${b.toFixed(2)}X`
    },
    results: {
      slope: b.toFixed(2),
      intercept: a.toFixed(2),
      regressionLine
    }
  };
};

const calculateRegressionXonY = (data: any[]) => {
  const xValues = data.map(row => row.midpoint);
  const yValues = data.map(row => row.frequency);
  
  const xMean = mean(xValues);
  const yMean = mean(yValues);
  
  const calculationTable = data.map(row => ({
    x: row.midpoint,
    y: row.frequency,
    xy: row.midpoint * row.frequency,
    ySquared: Math.pow(row.frequency, 2)
  }));

  const sumXY = sum(calculationTable.map(row => row.xy));
  const sumYSquared = sum(calculationTable.map(row => row.ySquared));
  
  const b = sumXY / sumYSquared;
  const a = xMean - b * yMean;

  const regressionLine = yValues.map(y => ({
    y,
    x: a + b * y
  }));

  return {
    formulas: StatisticalFormulas["Regression (X on Y)"],
    steps: {
      calculationTable,
      regressionCalc: `X = ${a.toFixed(2)} + ${b.toFixed(2)}Y`
    },
    results: {
      slope: b.toFixed(2),
      intercept: a.toFixed(2),
      regressionLine
    }
  };
};

const calculateStraightLineFit = (data) => {
  const n = data.length;
  const x = data.map(row => row.midpoint);
  const y = data.map(row => row.frequency);
  
  const sumX = sum(x);
  const sumY = sum(y);
  const sumXY = sum(x.map((xi, i) => xi * y[i]));
  const sumXSquare = sum(x.map(xi => xi * xi));
  
  const b = (n * sumXY - sumX * sumY) / (n * sumXSquare - sumX * sumX);
  const a = (sumY - b * sumX) / n;
  
  const fittedLine = x.map(xi => ({
    x: xi,
    y: a + b * xi
  }));

  return {
    formulas: StatisticalFormulas["Straight Line Fit"],
    steps: {
      calculationTable: data.map((row, i) => ({
        ...row,
        x: x[i],
        y: y[i],
        xy: x[i] * y[i],
        xSquared: x[i] * x[i]
      })),
      coefficients: { a, b }
    },
    results: {
      equation: `Y = ${a.toFixed(2)} + ${b.toFixed(2)}X`,
      fittedLine
    }
  };
};

const calculateParabolaFit = (data) => {
  const x = data.map(row => row.midpoint);
  const y = data.map(row => row.frequency);
  
  const n = data.length;
  const sumX = sum(x);
  const sumY = sum(y);
  const sumXY = sum(x.map((xi, i) => xi * y[i]));
  const sumXSquare = sum(x.map(xi => xi * xi));
  const sumXCube = sum(x.map(xi => pow(xi, 3)));
  const sumXFourth = sum(x.map(xi => pow(xi, 4)));
  const sumX2Y = sum(x.map((xi, i) => xi * xi * y[i]));
  
  const a = mean(y) - mean(x.map(xi => xi * xi)) * 0.5;
  const b = sumXY / sumXSquare;
  const c = sumX2Y / sumXFourth;
  
  const fittedCurve = x.map(xi => ({
    x: xi,
    y: a + b * xi + c * xi * xi
  }));

  return {
    formulas: StatisticalFormulas["Parabola Fit"],
    steps: {
      calculationTable: data.map((row, i) => ({
        ...row,
        x: x[i],
        y: y[i],
        xSquared: x[i] * x[i],
        xy: x[i] * y[i],
        x2y: x[i] * x[i] * y[i]
      })),
      coefficients: { a, b, c }
    },
    results: {
      equation: `Y = ${a.toFixed(2)} + ${b.toFixed(2)}X + ${c.toFixed(2)}X²`,
      fittedCurve
    }
  };
};

const calculateExponentialCurveFit = (data) => {
  const x = data.map(row => row.midpoint);
  const y = data.map(row => row.frequency);
  const lnY = y.map(yi => Math.log(yi));
  
  const n = data.length;
  const sumX = sum(x);
  const sumLnY = sum(lnY);
  const sumXLnY = sum(x.map((xi, i) => xi * lnY[i]));
  const sumXSquare = sum(x.map(xi => xi * xi));
  
  const b = (n * sumXLnY - sumX * sumLnY) / (n * sumXSquare - sumX * sumX);
  const lnA = (sumLnY - b * sumX) / n;
  const a = Math.exp(lnA);
  
  const fittedCurve = x.map(xi => ({
    x: xi,
    y: a * Math.exp(b * xi)
  }));

  return {
    formulas: StatisticalFormulas["Exponential Curve Fit"],
    steps: {
      calculationTable: data.map((row, i) => ({
        ...row,
        x: x[i],
        y: y[i],
        lnY: lnY[i],
        xLnY: x[i] * lnY[i]
      })),
      coefficients: { a, b }
    },
    results: {
      equation: `Y = ${a.toFixed(2)}e^(${b.toFixed(2)}X)`,
      fittedCurve
    }
  };
};

const calculatePowerCurveFit = (data) => {
  const x = data.map(row => row.midpoint);
  const y = data.map(row => row.frequency);
  const lnX = x.map(xi => Math.log(xi));
  const lnY = y.map(yi => Math.log(yi));
  
  const n = data.length;
  const sumLnX = sum(lnX);
  const sumLnY = sum(lnY);
  const sumLnXLnY = sum(lnX.map((lnXi, i) => lnXi * lnY[i]));
  const sumLnXSquare = sum(lnX.map(lnXi => lnXi * lnXi));
  
  const b = (n * sumLnXLnY - sumLnX * sumLnY) / (n * sumLnXSquare - sumLnX * sumLnX);
  const lnA = (sumLnY - b * sumLnX) / n;
  const a = Math.exp(lnA);
  
  const fittedCurve = x.map(xi => ({
    x: xi,
    y: a * Math.pow(xi, b)
  }));

  return {
    formulas: StatisticalFormulas["Power Curve Fit"],
    steps: {
      calculationTable: data.map((row, i) => ({
        ...row,
        x: x[i],
        y: y[i],
        lnX: lnX[i],
        lnY: lnY[i],
        lnXLnY: lnX[i] * lnY[i]
      })),
      coefficients: { a, b }
    },
    results: {
      equation: `Y = ${a.toFixed(2)}X^${b.toFixed(2)}`,
      fittedCurve
    }
  };
};

export const calculateStats = (type: string, data: any[]) => {
  const processedData = data.map(row => {
    const [min, max] = row.classInterval.split("-").map(Number);
    return {
      ...row,
      midpoint: (min + max) / 2
    };
  });

  switch (type) {
    case "Mean, Median & Mode (Discrete Data)":
      return calculateDiscreteMMM(processedData);
    case "Median & Mode (Continuous Data)":
      return calculateContinuousMMM(processedData);
    case "Mean Deviation & Std Dev (Discrete Data)":
      return calculateDiscreteDeviations(processedData);
    case "Mean Deviation & Std Dev (Continuous Data)":
      return calculateContinuousDeviations(processedData);
    case "Skewness & Kurtosis":
      return calculateSkewnessKurtosis(processedData);
    case "Straight Line Fit":
      return calculateStraightLineFit(processedData);
    case "Parabola Fit":
      return calculateParabolaFit(processedData);
    case "Exponential Curve Fit":
      return calculateExponentialCurveFit(processedData);
    case "Power Curve Fit":
      return calculatePowerCurveFit(processedData);
    default:
      return null;
  }
};